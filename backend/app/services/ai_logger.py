"""
Structured logging for AI calls: latency, tokens, errors.
"""
import logging
import time
from functools import wraps
from typing import Optional

logger = logging.getLogger("ai_metrics")
logger.setLevel(logging.INFO)


def log_ai_call(
    endpoint: str,
    user_id: int,
    prompt_version: str,
    latency_ms: int,
    tokens_used: int,
    success: bool,
    error: Optional[str] = None,
):
    """Log a structured AI call record."""
    record = {
        "event": "ai_call",
        "endpoint": endpoint,
        "user_id": user_id,
        "prompt_version": prompt_version,
        "latency_ms": latency_ms,
        "tokens_used": tokens_used,
        "success": success,
    }
    if error:
        record["error"] = error

    if success:
        logger.info(f"AI call OK: {record}")
    else:
        logger.error(f"AI call FAILED: {record}")

    return record


def timed_ai_call(endpoint: str, prompt_version: str):
    """Decorator that times an AI service call and logs metrics."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start = time.monotonic()
            user_id = kwargs.get("user_id", 0)
            try:
                result = await func(*args, **kwargs)
                elapsed = int((time.monotonic() - start) * 1000)
                tokens = getattr(result, "tokens_used", 0) if hasattr(result, "tokens_used") else 0
                log_ai_call(
                    endpoint=endpoint,
                    user_id=user_id,
                    prompt_version=prompt_version,
                    latency_ms=elapsed,
                    tokens_used=tokens,
                    success=True,
                )
                return result
            except Exception as e:
                elapsed = int((time.monotonic() - start) * 1000)
                log_ai_call(
                    endpoint=endpoint,
                    user_id=user_id,
                    prompt_version=prompt_version,
                    latency_ms=elapsed,
                    tokens_used=0,
                    success=False,
                    error=str(e),
                )
                raise
        return wrapper
    return decorator
