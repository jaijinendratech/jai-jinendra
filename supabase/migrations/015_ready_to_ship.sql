-- "Ready to ship": admin marks an order packed, Shiprocket is asked to pick it up.
-- The enum value lives in its own migration (new enum values can't be used in
-- the transaction that adds them).

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_to_ship' BEFORE 'dispatched';
