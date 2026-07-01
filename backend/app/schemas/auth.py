import re
import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$")


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=10, max_length=72)

    @field_validator("full_name")
    @classmethod
    def strip_and_validate_name(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[A-Za-z\u00C0-\u024F\s'\-\.]+$", v):
            raise ValueError("Name contains invalid characters")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be 10-72 characters and include an uppercase letter, "
                "a lowercase letter, a digit, and a special character"
            )
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    plan: str
    is_verified: bool
    words_used_this_period: int
    words_quota: int

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str
