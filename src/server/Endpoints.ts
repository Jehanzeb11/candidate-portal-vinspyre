const ENDPOINTS = {
    GET_TEST:"/recruitment/candidate-profile/test",
    SUBMIT_TEST:"/recruitment/candidate-profile/test/submit",
    VIOLATION:"/recruitment/candidate-profile/test/violations",
    UPLOAD_DOCUMENTS:"/recruitment/candidate-profile/documents",
    ACCEPT_OFFER:"/recruitment/candidate-profile/offers/accept",
    REJECT_OFFER:"/recruitment/candidate-profile/offers/reject",
    GET_ONBOARDING:"/recruitment/candidate-profile/onboarding",
    UPDATE_ONBOARDING_PROGRESS:(id: string) => `/recruitment/candidate-profile/onboarding/content/${id}/progress`,
    COMPLETE_ONBOARDING_CONTENT:(id: string) => `/recruitment/candidate-profile/onboarding/content/${id}/complete`,
}

export default ENDPOINTS