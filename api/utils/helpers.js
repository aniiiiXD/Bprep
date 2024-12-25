function validateUserSession(req){
    if(!req.user || !req.user.id){
        throw new Error("Invalid user session")
    }
    req.user.id;
}

module.exports = { validateUserSession }