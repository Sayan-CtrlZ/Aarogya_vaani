"""Automated tests for AarogyaVaani Authentication REST APIs."""

import random
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_demo_patient():
    """Verify that default demo patient (Mamta Debbarma) can sign in."""
    res = client.post("/api/auth/login", json={"phone": "9862100000", "pin": "1234"})
    assert res.status_code == 200
    data = res.json()
    assert "98621" in data["phone"]
    assert "Mamta" in data["name"] or "AV-" in data["patient_ref"]
    assert "patient_ref" in data
    assert "pin_hash" not in data


def test_login_invalid_credentials():
    """Verify that wrong PIN returns 401 Unauthorized."""
    res = client.post("/api/auth/login", json={"phone": "9862100000", "pin": "9999"})
    assert res.status_code == 401
    assert "detail" in res.json()


def test_register_new_patient_and_login():
    """Verify that new patient can register and then sign in."""
    rand_phone = f"98{random.randint(10000000, 99999999)}"
    new_user = {
        "name": "Bappaditya Test",
        "phone": rand_phone,
        "pin": "5678",
        "district": "West District",
        "age": "26",
        "gender": "Male",
        "preferred_language": "bn-IN",
    }
    # 1. Register
    reg_res = client.post("/api/auth/register", json=new_user)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["name"] == "Bappaditya Test"
    assert reg_data["phone"] == rand_phone
    assert reg_data["gender"] == "Male"
    assert reg_data["age"] == "26"
    assert "patient_ref" in reg_data
    assert "pin_hash" not in reg_data

    # 2. Duplicate registration returns 409 Conflict
    dup_res = client.post("/api/auth/register", json=new_user)
    assert dup_res.status_code == 409

    # 3. Login with newly created credentials
    login_res = client.post("/api/auth/login", json={"phone": rand_phone, "pin": "5678"})
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["name"] == "Bappaditya Test"
    assert login_data["phone"] == rand_phone
    assert login_data["patient_ref"] == reg_data["patient_ref"]
