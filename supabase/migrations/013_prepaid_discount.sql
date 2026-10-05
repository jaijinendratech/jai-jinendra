-- Flat prepaid (Razorpay) discount stored separately from coupon discount.

ALTER TABLE orders
  ADD COLUMN prepaid_discount_paise INT NOT NULL DEFAULT 0;
