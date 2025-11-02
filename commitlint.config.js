export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"body-max-line-length": [0, "always"], // Disable body line length limit
		"header-max-length": [0, "always"], // Disable header line length limit
	},
};
