CREATE TABLE IF NOT EXISTS klasa_live_presence (
  github_id text PRIMARY KEY,
  sharing_id uuid NOT NULL,
  name text NOT NULL,
  room text CHECK (char_length(room) BETWEEN 1 AND 60),
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  accuracy double precision CHECK (accuracy BETWEEN 0 AND 40000000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (latitude IS NULL AND longitude IS NULL AND accuracy IS NULL AND room IS NOT NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL AND accuracy IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS klasa_live_presence_updated_at
  ON klasa_live_presence (updated_at);

CREATE TABLE IF NOT EXISTS klasa_live_closed_shares (
  member_id text NOT NULL,
  sharing_id uuid NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, sharing_id)
);

CREATE INDEX IF NOT EXISTS klasa_live_closed_shares_closed_at
  ON klasa_live_closed_shares (closed_at);

CREATE OR REPLACE FUNCTION klasa_live_change_sharing(
  member text, incoming uuid, stopping boolean, display_name text,
  room_label text, lat double precision, lon double precision, meters double precision,
  expires_in integer
) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE current_share uuid;
BEGIN
  -- Order start and stop for the same member even when no presence row exists yet.
  PERFORM pg_advisory_xact_lock(hashtextextended('klasa-live:' || member, 0));
  SELECT sharing_id INTO current_share FROM klasa_live_presence WHERE github_id = member;

  IF stopping THEN
    DELETE FROM klasa_live_presence WHERE github_id = member
      AND (incoming IS NULL OR sharing_id = incoming);
    IF coalesce(incoming, current_share) IS NOT NULL THEN
      INSERT INTO klasa_live_closed_shares (member_id, sharing_id)
      VALUES (member, coalesce(incoming, current_share)) ON CONFLICT DO NOTHING;
    END IF;
    RETURN true;
  END IF;

  IF EXISTS (SELECT 1 FROM klasa_live_closed_shares WHERE member_id = member AND sharing_id = incoming) THEN
    RETURN false;
  END IF;
  IF current_share = incoming THEN
    RETURN EXISTS (SELECT 1 FROM klasa_live_presence WHERE github_id = member
      AND updated_at > now() - make_interval(secs => expires_in));
  END IF;
  INSERT INTO klasa_live_presence (github_id, sharing_id, name, room, latitude, longitude, accuracy)
  VALUES (member, incoming, display_name, room_label, lat, lon, meters)
  ON CONFLICT (github_id) DO UPDATE SET sharing_id = EXCLUDED.sharing_id,
    name = EXCLUDED.name, room = EXCLUDED.room, latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude, accuracy = EXCLUDED.accuracy, updated_at = now();
  IF current_share IS NOT NULL THEN
    INSERT INTO klasa_live_closed_shares (member_id, sharing_id)
    VALUES (member, current_share) ON CONFLICT DO NOTHING;
  END IF;
  RETURN true;
END;
$$;
