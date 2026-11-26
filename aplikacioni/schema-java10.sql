-- Java 10: kërkesa për udhëtim. Safe to apply more than once.
CREATE TABLE IF NOT EXISTS kerkesa_udhetimi (
  id BIGSERIAL PRIMARY KEY,
  ride_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  passenger_id TEXT NOT NULL REFERENCES profilet(github_id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ride_id, passenger_id)
);

CREATE INDEX IF NOT EXISTS kerkesa_udhetimi_ride_status_idx
  ON kerkesa_udhetimi (ride_id, status);

-- Serialize acceptance on the request row, then decrement seats and update
-- status within this single PostgreSQL function call/transaction.
CREATE OR REPLACE FUNCTION prano_kerkesen(p_request_id BIGINT, p_driver_id TEXT)
RETURNS TABLE (request_id BIGINT, request_status TEXT, seats_left INTEGER, outcome TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_ride_id TEXT;
  v_status TEXT;
  v_owner TEXT;
  v_role TEXT;
  v_seats INTEGER;
BEGIN
  SELECT k.ride_id, k.status INTO v_ride_id, v_status
  FROM kerkesa_udhetimi k
  WHERE k.id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT p_request_id, NULL::TEXT, NULL::INTEGER, 'not_found'::TEXT;
    RETURN;
  END IF;

  SELECT u.shofer_id, p.roli INTO v_owner, v_role
  FROM udhetimet u LEFT JOIN profilet p ON p.github_id = u.shofer_id
  WHERE u.id = v_ride_id;
  IF v_owner IS DISTINCT FROM p_driver_id OR v_role IS DISTINCT FROM 'shofer' THEN
    RETURN QUERY SELECT p_request_id, v_status, NULL::INTEGER, 'forbidden'::TEXT;
    RETURN;
  END IF;

  SELECT u.vende INTO v_seats FROM udhetimet u WHERE u.id = v_ride_id FOR UPDATE;
  IF v_status = 'accepted' THEN
    RETURN QUERY SELECT p_request_id, v_status, v_seats, 'already_accepted'::TEXT;
    RETURN;
  END IF;
  IF v_seats IS NULL OR v_seats <= 0 THEN
    RETURN QUERY SELECT p_request_id, v_status, v_seats, 'no_seats'::TEXT;
    RETURN;
  END IF;

  UPDATE udhetimet SET vende = vende - 1 WHERE id = v_ride_id;
  UPDATE kerkesa_udhetimi SET status = 'accepted' WHERE id = p_request_id;
  RETURN QUERY SELECT p_request_id, 'accepted'::TEXT, v_seats - 1, 'accepted'::TEXT;
END;
$$;
