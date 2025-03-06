export {inputMasking};

//INPUT MASKING
function inputMasking() {
    Inputmask("99/99").mask("birthDate")
    Inputmask("99/99").mask("bilirubinDate")
    Inputmask("99:99").mask("birthTime")
    Inputmask("99:99").mask("bilirubinTime")
    Inputmask("99u").mask("gestationWeek")
    Inputmask("99[9] µmol/L").mask("bilirubinValue")
};