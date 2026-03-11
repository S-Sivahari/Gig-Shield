# utils/date_utils.py
# IST (Indian Standard Time, UTC+5:30) date helpers.
# All user-facing times must be converted to IST; DB stores UTC.

from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))


def now_ist() -> datetime:
    """Current datetime in IST."""
    return datetime.now(IST)


def to_ist(dt: datetime) -> datetime:
    """Convert any UTC datetime to IST."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)   # Assume UTC if naive
    return dt.astimezone(IST)


def format_ist(dt: datetime, fmt: str = "%d %b %Y, %I:%M %p IST") -> str:
    """Human-readable IST string, e.g. '15 Jan 2026, 03:45 PM IST'."""
    return to_ist(dt).strftime(fmt)


def days_until(target: datetime) -> int:
    """Number of whole days from now (IST) until `target`."""
    delta = to_ist(target).date() - now_ist().date()
    return delta.days
