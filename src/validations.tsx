function validateUsername(username: string): string {
    // Check length
    if (username.length < 4) {
        return "Username has to be at least 4 symbols.";
    }
    if (username.length > 32) {
        return "Username cannot exceed 32 symbols.";
    }

    // Check for allowed characters
    const validPattern = /^[A-Za-z0-9_]+$/;
    if (!validPattern.test(username)) {
        return "Username can only contain letters, numbers, and underscores.";
    }

    return ""; // Return empty string if all validations pass
}

function validatePassword(password: string): string {
    // Check length
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (password.length > 64) {
        return "Password cannot exceed 64 characters.";
    }

    // Check for required character types
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character (e.g., !@#$%^&*).";
    }

    return ""; // Return empty string if all validations pass
}

export default {
    validateUsername: validateUsername,
    validatePassword: validatePassword
};