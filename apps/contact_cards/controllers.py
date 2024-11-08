"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from .models import get_user_email

@action('index')
@action.uses('index.html', db, auth.user)
def index():
    return {
        'contacts_url': URL('contacts'),
    }

@action('contacts', method="GET")
@action.uses(db, auth.user)
def get_contacts():
    contacts = []
    for row in db(db.contact_card.user_email == get_user_email()).select(orderby=db.contact_card.id):
        contacts.append({
            "id": row.id,
            "name": row.contact_name,
            "company": row.contact_affiliation,
            "desc": row.contact_description,
            "img": row.contact_image,
        })
    return contacts

@action('contacts', method="POST")
@action.uses(db, auth.user)
def add_contact():
    row_id = db.contact_card.insert(
        user_email=get_user_email()
    )
    db.commit()
    return str(row_id)

@action('contacts', method="PUT")
@action.uses(db, auth.user)
def edit_contact():
    row_id  = int(request.json.get("id"))

    name    = request.json.get("name")
    company = request.json.get("company")
    desc    = request.json.get("desc")
    img     = request.json.get("img")

    this_entry = db(
        (db.contact_card.id == row_id) & (db.contact_card.user_email == get_user_email())
    )
    this_entry.update(
        contact_name=name,
        contact_affiliation=company,
        contact_description=desc,
        contact_image=img,
    )
    db.commit()

@action('contacts', method="DELETE")
@action.uses(db, auth.user)
def delete_contact():
    row_id = int(request.params.get("id"))
    db(
        (db.contact_card.id == row_id) & (db.contact_card.user_email == get_user_email())
    ).delete()
    db.commit()
