/*****  ACTIONS ******/


/* Action Types */

export const VISIT_CHECKIN = 'VISIT_CHECKIN'
export const VISIT_CHECKOUT = 'VISIT_CHECKOUT'
export const SUBMIT_NOTES = 'SUBMIT_NOTES'
export const ADD_AVAILABILITY = 'ADD_AVAILABILITY'
export const REMOVE_AVAILABILITY = 'REMOVE_AVAILABILITY'

/* Action Constants */

export function visit_checkin(index) {
    return { type: VISIT_CHECKIN, index }
}

export function visit_checkout(index) {
    return { type: VISIT_CHECKOUT, index }
}

export function submit_notes(object) {
    return { type: SUBMIT_NOTES, object }
}

export function add_availability(object) {
    return { type: ADD_AVAILABILITY, object }
}

export function remove_availability(object) {
    return { type: REMOVE_AVAILABILITY, object }
}



