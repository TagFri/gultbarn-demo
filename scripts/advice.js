import {child, labs} from "./inputHandler.js"
export {updateAdvice}

class Advice {
    constructor(title, description, icon) {
        this.title = title
        this.description = description
        this.icon = icon
    }
}
const noAdvice = new Advice(
    "Ingen oppfølging nødvendig",
    "Barnet trenger ikke videre blodprøvekontroller eller oppfølging for gulsott. Bilirubinnivåene er trygge, og det er ingen behov for lysbehandling eller annen behandling.",
    "../assets/icons/advice/no_follow_up.svg"
);
const bloodSample = new Advice(
    "Blodprøvekontroll anbefales",
    `Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene. Se pediatriveilederen for diagnostiske vurderinger. <br><span class="bold">Krysningstidspunkt:${newLabDate}</span>`,
    "../assets/icons/advice/bloodtest.svg"
);
const lightTherapy = new Advice(
    "Lysbehandling anbefales",
    "Barnet har bilirubinnivåer som krever lysbehandling. Behandlingen bør startes snarest mulig.",
    "../assets/icons/advice/phototherapy.svg"
);
const prolongedIcterus = new Advice(
    "Prolongert ikterus - videre utredning anbefales",
    "Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n Se pediatriveilederen for diagnostiske vurderinger.",
    "../assets/icons/advice/prolonged_icterus.svg"
);
const earlyIcterus = new Advice(
    "Ikterus første levedøgn - videre utredning anbefales",
    "Ikterus som oppstår første levedøgn regnes som patologisk. Videre utredning med blodprøver anbefales som angitt i pediatriveilederen.",
    "../assets/icons/advice/early_onset_icterus.svg"
);
const transfusion = new Advice(
    "Transfusjon anbefales",
    "Barnet har alvorlig høye bilirubinverdier. Barnet skal legges inn på sykehus umiddelbart og skal vurderes for utskiftningstransfusjon.",
    "../assets/icons/advice/transfusion.svg"
);
let advices = [noAdvice, bloodSample, lightTherapy, prolongedIcterus, earlyIcterus, transfusion]

function getAdvice() {
    //Lab values
    let lastBilirubinValue = labs[labs.length - 1].bilirubin;
    let lastBilirubinDate = labs[labs.length - 1].timeDate;
    let bilirubinSlope = null;

    //Lightlimits
    let transfusionLimit = null;
    let lightlimit = child.lightlimit[10];
    let lightSlope = null;

    //Childinfo
    let gestastionWeek = child.gestationWeek;
    let birthDate = child.timeDate;

    //Extrapolationinfo
    let newLabDate = null;

    /* ADVICE ALGORUTHEM */
    //Transfusion
    if (lastBilirubinValue > gestastionWeek * 10
        ||bilirubinSlope > 10
        ||lastBilirubinValue > transfusionLimit) {
        return(advices[transfusion])
    }
//Lighttherapy
    else if (lastBilirubinValue > lightlimit) {
        return(advices[lightTherapy])
    }
//Early icterus
    else if (lastBilirubinDate < birthDate + 1) {
        return(advices[earlyIcterus])
    }
//blood sample follow up
    else if (newLabDate < lastBilirubinDate + 14
        || lastBilirubinValue > (lightlimit - 50)) {
        return(advices[bloodSample])
    }
//Prolonges icterus
    else if (lastBilirubinDate > birthDate + 14) {
        return(advices[prolongedIcterus])
    }
//No advice
    else if (bilirubinSlope <= 0
        || newLabDate > birthDate + 14) {
        return(advices[noAdvice])
    }
//Error handling
    else {
        console.log("error, no advice selected")
    }
}

function updateAdvice() {
    //Get advice icon
    const adviceElement = getAdvice()
    //Update advice title
    document.getElementById("advice-title").innerHTML = adviceElement.title
    //Update advice description
    document.getElementById("advice-paragraph").innerHTML = adviceElement.description
    //Update advice icon
    document.getElementById("advice-container").backgroundImage.url = adviceElement.icon
}