import AJV from "ajv";
import addFormats from "ajv-formats";

//schemas
import loginSchema from "./schemas/login.json"
import signupSchema from "./schemas/signup.json"
import contWithGoogleSchema from "./schemas/contWithGoogle.json"

// formats
const strongPassword = new RegExp(
	"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);
const alpha = new RegExp(/^[a-zA-Z]+$/);
const alphNumericRgx = new RegExp(/[a-zA-Z0-9]/);
const checkForObjectId = new RegExp(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i);
const checkIfStrOfInt = new RegExp("^[0-9]*$");
const checkIfStrOfFlt = new RegExp("[+-]?([0-9]*[.])?[0-9]+");
const checkIfUnvSize = new RegExp("^(d*(?:M|X{0,2}[SL]))(?:$|s+.*$)");
const checkIfhexColor = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

const ajv = new AJV({
	allErrors: true,
	coerceTypes: true,
	allowUnionTypes: true,
	formats: {
		"strong-password": (password) => strongPassword.test(password),
		"int-string-only": (string) => checkIfStrOfInt.test(string),
		"number-string": (string) => checkIfStrOfFlt.test(string),

		objectId: (string) => checkForObjectId.test(string),

		"only-letters": (alpah) => alpha.test(alpah),

		"alph-numeric": (string) => alphNumericRgx.test(string),

		"universal-size": (string) => checkIfUnvSize.test(string),

		"cate-abrv": (input) => input.trim().length === 2,

		"hex-decimal-color": (string) => checkIfhexColor.test(string),

		"positive-number": (input) => +input >= 0,

		"positive-intiger": (input) => {
			const num = parseFloat(input);
			if (typeof input === "string") {
				if (isNaN(num)) return false;
			}
			if (Math.floor(num) !== num) return false;
			return true;
		},

		"five-star-rating": (input) => +input >= 0 && +input <= 5,
	},
  schemas: {
    login:loginSchema,
    "sign-up":signupSchema,
    "continue-with-google":contWithGoogleSchema
  },
});

addFormats(ajv);


export default ajv

//schemas
