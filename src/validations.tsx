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

function validateTableName(tableName: any) {
  if (typeof tableName != "string") {
    return "Table name has to be a string";
  }
  // Check length
  if (tableName.length < 1) {
    return "Table name has to be at least 1 symbol";
  }
  if (tableName.length > 128) {
    return "Table name cannot exceed 128 symbols";
  }

  // Check for allowed characters
  const validPattern = /^[A-Z0-9_]+$/;
  if (!validPattern.test(tableName)) {
    return "Table name can only contain capital letters, numbers, and underscores.";
  }

  return ""; // Return empty string if all validations pass
}

function validateUserColumnType(typeName: string): string {
  // Define the valid data types
  const validTypes = ["number", "string", "date"];

  // Check if the provided type name is valid.
  if (!validTypes.includes(typeName)) {
    return `Error: "${typeName}" is not a valid data type. Valid types are: ${validTypes.join(
      ", "
    )}`;
  }
  // If type is valid, return an empty string
  return ""; // Return empty string if all validations pass
}

function validateUserColumnName(columnName: string): string {
  // Check length
  if (columnName.length < 1) {
    return "Column name has to be at least 1 symbol";
  }
  if (columnName.length > 128) {
    return "Column name cannot exceed 128 symbols";
  }

  // Check for allowed characters
  const validPattern = /^[a-z0-9_áéíóúüñ]+$/;
  if (!validPattern.test(columnName)) {
    return "Table column name can only contain lowercase letters, numbers, and underscores";
  }

  return ""; // Return empty string if all validations pass
}

export default {
  validateUsername: validateUsername,
  validatePassword: validatePassword,
  validateTableName: validateTableName,
  validateUserColumnType: validateUserColumnType,
  validateUserColumnName: validateUserColumnName,
};
