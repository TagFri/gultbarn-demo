
class Advice {
    constructor(title, description, icon) {
        this.title = title
        this.description = description
        this.dynamic = dynamic
        this.icon = icon
    }
}
advices = [
    noAdvice = new Advice(
        title = "Ingen oppfølging nødvendig",
        description = "Barnet trenger ikke videre blodprøvekontroller eller oppfølging for gulsott. Bilirubinnivåene er trygge, og det er ingen behov for lysbehandling eller annen behandling.",
        icon = "../assets/icons/advice/no_follow_up.svg"
    ),
    bloodSample = new Advice(
        title = "Blodprøvekontroll anbefales",
        description = `Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene. Se pediatriveilederen for diagnostiske vurderinger. <br><span class="bold">Krysningstidspunkt:${newLabDate}</span>`,
        icon = "../assets/icons/advice/bloodtest.svg"
    ),
    lightTherapy = new Advice(
        title = "Lysbehandling anbefales",
        description = "Barnet har bilirubinnivåer som krever lysbehandling. Behandlingen bør startes snarest mulig.",
        icon = "../assets/icons/advice/phototherapy.svg"
    ),
    prolongedIcterus = new Advice(
        title = "Prolongert ikterus - videre utredning anbefales",
        description = "Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n Se pediatriveilederen for diagnostiske vurderinger.",
        icon = "../assets/icons/advice/prolonged_icterus.svg"
    ),
    earlyIcterus = new Advice(
        title = "Ikterus første levedøgn - videre utredning anbefales",
        description = "Ikterus som oppstår første levedøgn regnes som patologisk. Videre utredning med blodprøver anbefales som angitt i pediatriveilederen.",
        icon = "../assets/icons/advice/early_onset_icterus.svg"
    ),
    transfusion = new Advice(
        title = "Transfusjon anbefales",
        description = "Barnet har alvorlig høye bilirubinverdier. Barnet skal legges inn på sykehus umiddelbart og skal vurderes for utskiftningstransfusjon.",
        icon = "../assets/icons/advice/transfusion.svg"
    )
]

let adviceParameters = {
    //Lab values
    lastBilirubinValue: null,
    lastBilirubinDate: null,
    bilirubinSlope: null,

//Lightlimits
    transfusionLimit: null,
    lightlimit: null,
    lightSlope: null,

//Childinfo
    gestastionWeek: null,
    birthDate: null,

//Extrapolationinfo
    newLabDate: null
}

function getAdvice() {
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

}
