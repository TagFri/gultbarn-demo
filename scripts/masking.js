export {masking};

//INPUT MASKING
function masking() {
    Inputmask("99/99").mask("birthDate")
    Inputmask("99/99").mask("labDate")
    Inputmask("99:99").mask("birthTime")
    Inputmask("99:99").mask("labTime")
    Inputmask("99+9").mask("gestation")
    Inputmask("99[9] µmol/L").mask("bilirubinValue")
};