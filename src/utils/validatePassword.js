export const validatePassword = password => {
	const minLength = password.length >= 8;
	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumber = /\d/.test(password);

	if (!minLength) {
		return 'La contraseña debe tener al menos 8 caracteres';
	}

	if (!hasUppercase) {
		return 'La contraseña debe incluir al menos una letra mayúscula';
	}

	if (!hasLowercase) {
		return 'La contraseña debe incluir al menos una letra minúscula';
	}

	if (!hasNumber) {
		return 'La contraseña debe incluir al menos un número';
	}

	return null;
};
