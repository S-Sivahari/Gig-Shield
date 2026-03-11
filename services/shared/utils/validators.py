# utils/validators.py
# India-specific field validators used in Pydantic schemas and service code.

import re


def validate_phone(phone: str) -> bool:
    """Accept 10-digit Indian mobile numbers (with optional +91 prefix)."""
    cleaned = re.sub(r"[\s\-]", "", phone)
    return bool(re.match(r"^(\+91)?[6-9]\d{9}$", cleaned))


def validate_aadhaar(aadhaar: str) -> bool:
    """Aadhaar: exactly 12 digits, cannot start with 0 or 1."""
    return bool(re.match(r"^[2-9]\d{11}$", aadhaar.replace(" ", "")))


def validate_pan(pan: str) -> bool:
    """PAN card: format AAAAA9999A (5 alpha, 4 digit, 1 alpha)."""
    return bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan.upper()))


def validate_ifsc(ifsc: str) -> bool:
    """IFSC code: 4 alpha (bank code) + 0 + 6 alphanumeric (branch code)."""
    return bool(re.match(r"^[A-Z]{4}0[A-Z0-9]{6}$", ifsc.upper()))


def validate_pincode(pincode: str) -> bool:
    """Indian PIN code: exactly 6 digits, cannot start with 0."""
    return bool(re.match(r"^[1-9]\d{5}$", pincode))
