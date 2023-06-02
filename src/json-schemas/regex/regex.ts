export const formats = {
	strongPassword: new RegExp(
		/^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/
  ),
  objectID:new RegExp(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
};
