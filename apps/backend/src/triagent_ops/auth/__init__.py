"""User authentication domain services and repositories."""

from triagent_ops.auth.repositories import (
    AuthRepository,
    AuthSessionRecord,
    UserRecord,
)
from triagent_ops.auth.service import (
    AuthError,
    AuthResult,
    AuthService,
    normalize_email,
)
from triagent_ops.auth.sqlite import SQLiteAuthRepository

__all__ = [
    "AuthError",
    "AuthRepository",
    "AuthResult",
    "AuthService",
    "AuthSessionRecord",
    "SQLiteAuthRepository",
    "UserRecord",
    "normalize_email",
]
