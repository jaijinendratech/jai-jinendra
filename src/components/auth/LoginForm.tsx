"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Chip,
  Form,
  Input,
  InputOTP,
  Label,
  REGEXP_ONLY_DIGITS,
} from "@heroui/react";
import { sendPhoneOtpAction, verifyPhoneOtpAction } from "@/lib/auth";

type LoginFormProps = {
  step: "phone" | "verify";
  phone: string;
  next: string;
  error?: string;
  fixedOtp?: string;
};

function errorMessage(error?: string): string | null {
  switch (error) {
    case "invalid_phone":
      return "Enter a valid 10-digit mobile number.";
    case "otp_failed":
    case "invalid_otp":
      return "OTP verification failed. Please try again.";
    case "admin_use_admin_login":
      return "Admin accounts must sign in at the admin login page.";
    default:
      return null;
  }
}

export function LoginForm({
  step,
  phone,
  next,
  error,
  fixedOtp,
}: LoginFormProps) {
  const [otp, setOtp] = useState("");
  const message = errorMessage(error);

  return (
    <Card className="w-full max-w-md border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <Card.Header className="flex flex-col items-start gap-2 px-8 pt-8">
        <Card.Title className="font-display text-2xl font-semibold text-on-surface">
          {step === "verify" ? "Enter OTP" : "Sign in with phone"}
        </Card.Title>
        <Card.Description className="text-sm text-on-surface-variant">
          Account required before checkout. We&apos;ll send a one-time code via
          SMS.
        </Card.Description>
        {fixedOtp ? (
          <Chip className="mt-1 bg-primary/10 text-primary">
            <Chip.Label>Dev OTP: {fixedOtp}</Chip.Label>
          </Chip>
        ) : null}
      </Card.Header>

      <Card.Content className="space-y-4 px-8 pb-8 pt-4">
        {message ? (
          <Alert status="danger">
            <Alert.Description>{message}</Alert.Description>
          </Alert>
        ) : null}

        {step === "phone" ? (
          <Form action={sendPhoneOtpAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-on-surface">
                Mobile number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="9876543210"
                defaultValue={phone.replace(/^\+91/, "")}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-lg bg-primary font-bold text-white"
            >
              Send OTP
            </Button>
          </Form>
        ) : (
          <Form action={verifyPhoneOtpAction} className="flex flex-col gap-4">
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="token" value={otp} />
            <p className="text-sm text-on-surface-variant">
              Code sent to <span className="font-semibold text-on-surface">{phone}</span>
            </p>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-on-surface">
                6-digit OTP
              </Label>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
                name="token"
                aria-label="One-time password"
              >
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                </InputOTP.Group>
                <InputOTP.Separator />
                <InputOTP.Group>
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
            </div>
            <Button
              type="submit"
              variant="primary"
              isDisabled={otp.length !== 6}
              className="w-full rounded-lg bg-primary font-bold text-white"
            >
              Verify & continue
            </Button>
          </Form>
        )}

        <p className="text-center text-xs text-on-surface-variant">
          <Link href="/catalogue" className="text-primary hover:underline">
            Continue browsing
          </Link>
          {error === "admin_use_admin_login" ? (
            <>
              {" · "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Admin login
              </Link>
            </>
          ) : null}
        </p>
      </Card.Content>
    </Card>
  );
}
