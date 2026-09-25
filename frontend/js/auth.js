//signup
async function signUpUser(name, email, password) {
    return await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });
}
//sign in
async function signInUser(email, password) {
    return await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
}
//sign out
async function signOutUser() {
    return await supabaseClient.auth.signOut();
}
async function getCurrentSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    return session;
}
async function getCurrentUser() {
    const session = await getCurrentSession();
    return session ? session.user : null;
}
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}
async function sendPasswordReset(email, redirectUrl) {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
    });
}
async function updatePassword(newPassword) {
    return await supabaseClient.auth.updateUser({
        password: newPassword
    });
}
function getUserInitials(user) {
    if (!user) return "?";

    const name = user.user_metadata?.full_name || user.email || "?";

    if (name === user.email) {
        return name.charAt(0).toUpperCase();
    }

    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
        return parts[0][0].toUpperCase();
    }

    return "?";
}

function getUserDisplayName(user) {
    if (!user) return "User";
    return user.user_metadata?.full_name || user.email;
}