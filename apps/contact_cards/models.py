"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.now(datetime.timezone.utc)


db.define_table(
    'contact_card',
    Field('user_email', 'string', default=get_user_email),
    Field('contact_name', 'string'),
    Field('contact_affiliation', 'string'),
    Field('contact_description', 'text'),
    Field('contact_image', 'text'),
)

db.commit()
