import { Child              } from "./Child.js"
import { Bilirubin          } from "./Bilirubin.js";
import { GraphContainer     } from "./GraphContainer.js";
import { daysToAbsoluteDate } from "./generalFunctions.js"

export { Advice }

class Advice {

    //Hold current advice
    static currentAdvice = null;

    //Lag råd fra tittel
    static createAdvice(adviceTitle, child) {

        //URL ref for icons
        const url="assets/icons/advice/"

        function bloodSampleDescription() {

            let bloodsampleDescription = ``
            //Only one lab, else standard text.
            if (Bilirubin.numberOfBilirubins == 1) {
                bloodsampleDescription += `Bilirubinverdien er < 50 µM under lysgrensen. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.\n\nEr barnet sykt (sepsis, acidose, asfyksi) bør oppstart av lysbehandling vurderes.`
            }

            // >= 2 labs:
            else {

                //General advice with slope
                bloodsampleDescription += `Målingene er fortsatt høye, og trendlinjen for de to siste målepunktene er ${(Bilirubin.bilirubinSlope() < 0) ? 'svakt synkende' : 'svakt stigende'}. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.`

                //If extrapolation is active, get date
                bloodsampleDescription += `<br><br><span class="semi-bold">Krysningstidspunkt: 
            ${daysToAbsoluteDate(child.birthDateTime, Bilirubin.extrapolationPoint().x).toLocaleDateString('no-NO', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(',', ' kl.')
                }</span>`

                bloodsampleDescription += `<br><br>Kliniske symptomer som slapphet, irritabel, brekninger, hypoglykemi, acidose o.l. krever grundigere utredning. Se<a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.5-ikterus-oppfolging-etter-utskriving#:~:text=Vedvarende%20hyperbilirubinemi%3A" target="_blank">pediatriveilederen</a> for videre diagnostiske vurderinger.`

                //Om siste er 50 fra lysgrense
                if (GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) > -50) {
                    bloodsampleDescription += `<br><br><span class="semi-bold">OBS!</span> Siste bilirubinverdi er mindre enn 50 µM fra lysgrensen. Er barnet sykt (sepsis, acidose, asfyksi) bør oppstart av lysbehandling vurderes.`
                }

                //Om stigning er mer enn 100 per dag
                if ( Bilirubin.bilirubinSlope() > 100 ) {
                    bloodsampleDescription += `<br><br><span class="semi-bold">OBS!</span> Trendlinjen for de to siste målepunktene stiger med mer enn ≥ 100 µM per døgn. Grundigere utredning av årsak til ikterus anbefales.`
                }

            }

            return bloodsampleDescription
        }

        function transfusionDescription() {

            //Empty startstring
            let transfusionDescription = ""

            //Differentiate paths in to transfusion advice

            //Above transfusion limit
            if (GraphContainer.getInstance().distanceToGraph("transfusionGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) >= 0) {
                transfusionDescription += `Barnet har svært høye bilirubinverdier`
            }
            //Gestastional weeks text
            else if (Bilirubin.lastBilirubin() >= Child.getInstance().gestationWeek * 10) {
                transfusionDescription += `Bilirubin er mer enn 10 x gestasjonsuke`
            }
            //Bilirubin slope texxt
            else if (Bilirubin.bilirubinSlope() > 240) {
                transfusionDescription += `Bilirubin stiger mer enn 10 µmol/time`
            }

            //Fallback if none above are choicen
            if (transfusionDescription = "") {
                transfusionDescription += `Barnet har svært høye bilirubinverdier`
            }

            //Standard text for all paths in
            transfusionDescription += `, erfaren kliniker (bakvakt pediater) bør kontaktes for å vurdering av  utskiftningstransfusjon. Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.3-utskiftingstransfusjon#-helsebiblioteket-innhold-retningslinjer-pediatri-nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening-8-gulsott-og-hemolytisk-sykdom-83-utskiftingstransfusjon:~:text=og%20hemolytisk%20sykdom-,8.%203%20Utskiftingstransfusjon,-Sist%20faglig%20oppdatert" target="_blank">pediatriveilederen</a> for detaljert informasjon.`
        }

        switch(adviceTitle) {
            case "earlyIcterus":
                return new Advice(
                    "earlyIcterus",
                    "Ikterus første levedøgn  - videre utredning anbefales",
                    `Synlig gulsott som oppstår innen 1 døgns alder regnes alltid som patologisk. Videre utredning med blodprøver anbefales som angitt i <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.1-tidlig-ikterus-forste-710-dager#:~:text=Synlig%20gulsott%20innen%201%20d%C3%B8gns%20alder%20(alltid%20patologisk!)" target="_blank">pediatriveilederen</a>, vurder lysbehandling evt. transfusjon/IVIG ved svært høye verdier.`,
                    url + "early_onset_icterus.svg"
                );

                break;
            case "transfusion":
                return new Advice(
                    "transfusion",
                    "Utskiftningstransfusjon bør vurderes",
                    transfusionDescription(),
                    url + "transfusion.svg",
                    "var(--color-light-red)"
                );
                break;
            case "lightTherapy":
                return new Advice(
                    "lightTherapy",
                    "Lysbehandling anbefales",
                    `Barnet har bilirubinnivåer som overskrider lysgrensen. Lysbehandling er anbefalt. Behandlingen bør startes snarest mulig.<br><span class=semi-cold">Varighet</span>: Det anbefales 12–24 timers lysbehandling. Varighet kan individualiseres ut i fra hvor høye TSB-verdier var ved start lysbehandling, og i henhold til lokale rutiner.<br><br>Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.1-tidlig-ikterus-forste-710-dager#:~:text=Behandling%20og%20oppf%C3%B8lging" target="_blank">pediatriveilederen</a> for videre info.`,
                    url + "phototherapy.svg"
                );
                break;
            case "bloodSample":
                return new Advice(
                    "bloodSample",
                    "Blodprøvekontroll anbefales",
                    bloodSampleDescription(),
                    url + "bloodtest.svg"
                );
                break;
            case "prolongedIcterus":
                return new Advice(
                    "prolongedIcterus",
                    `Prolongert ikterus - videre utredning anbefales`,
                    `Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n\nVurder også: Hb, hvite, trombocytter, retikulocytter, ALAT, GT, TSH, FT4 og blodtype mor/barn, DAT av barnet (hvis ikke kjent tidligere).<br><br>Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.4-prolongert-ikterus-mistenkt-kolestase-1014-dagers-alder" target="_blank">pediatriveilederen</a> for videre utredning.`,
                    url + "prolonged_icterus.svg"
                );
                break;
            case "noFollowUp":
                return new Advice(
                    "noFollowUp",
                    "Ingen oppfølging nødvendig",
                    `Trendlinjen for de to siste målepunktene er ${(Bilirubin.bilirubinSlope()>=0?"svært avflatet":"synkende")}. Blodprøvekontroll er ikke nødvendig.<br><br>Foreldre bes å ta kontakt med helsestasjonen dersom de mener barnet får økende ikterus eller om ikterus vedvarer 3 uker etter siste kontakt, eller om barnet virker slapt eller sykt.`,
                    url + "no_follow_up.svg"
                );
                break;
            case "noAdvice":
                return new Advice(
                    "noAdvice",
                    "Ingen råd fra pediatriveilederen",
                    "Bilirubinverdien er lavere enn 50 µM under lysgrensa. Pediatriveilederen gir ingen konkrete råd ved ett enkelt målepunkt. Anvend klinisk skjønn, med en helhetlig vurdering av barnets klinikk og historikk.",
                    url + "no_advice.svg",
                    "var(--color-grey-light)"
                );
                break;
            case "deactivated":
                return new Advice(
                    "deactivated",
                    "Faglig råd",
                    "<br><br><br>",
                    url + "outcome_box_inactive.svg"
                );
                break;
            case "error":
                return new Advice(
                    "error",
                    "Wopsi! Noe har skjedd...",
                    "Beregninger har feilet, pc'en klikka eller verden går rett og slett under. Vanskelig å vite om du ikke sender oss en mail. Trykk på \"Gi tilbakemelding\" under så skal vi se på det så fort vi klarer!",
                    url + "error.svg",
                    "var(--color-grey-light)"
                );
                break;
        }
    }

    //Get single advice
    static setCurrentAdvice(child) {
        //If all bilirubins are removed -> deactive advice
        if (Bilirubin.numberOfBilirubins == 0) {
            this.currentAdvice = this.createAdvice("deactivated", child)
            return
        }

        //EARLY ICTERUS  < 1 Dag:
        if (Bilirubin.lastBilirubin().relativeDays < 1) {
            this.currentAdvice = this.createAdvice("earlyIcterus")
            return
        }

        //TRANSFUSJON -> 3 criterias
        if (
            //Last bilirubin is more/equal to gestational week * 10
            Bilirubin.lastBilirubin().bilirubinValue >= (child.gestationWeek * 10)
            ||
            //Last bilirubin is above/equal transfusionlimit
            GraphContainer.getInstance().distanceToGraph("transfusionGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) <= 0
            ||
            //Slope is above/equal 240
            Bilirubin.bilirubinSlope() >= 240
        ) {

            this.currentAdvice = this.createAdvice("transfusion", child)
            return
        }

        //LIGHT THERAPY
        //Last bilirubin above/equal light limit graph
        if (GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) <= 0) {
            this.currentAdvice = this.createAdvice("lightTherapy", child)
            return
        }

        //Late icterus
        //Lab after 14 days
        if (Bilirubin.lastBilirubin().relativeDays >= 14) {
            this.currentAdvice = this.createAdvice("lateIcterus", child)
            return
        }

        //BLOOD SAMPLE -> 3 criterias
        if (
            //Positiv bilirubinslope + extrapolation < 14 day in the future
            (Bilirubin.bilirubinSlope() > 0 && Bilirubin.extrapolationPoint().x < Bilirubin.lastBilirubin().relativeDays + 14)
            ||
            // Last lab under 50 from lightlimit
            GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) <= 50
            ||
            // Bilirubin above 280 with slope decrease of less than 20 per day
            (Bilirubin.lastBilirubin().bilirubinValue >= 280 && Bilirubin.bilirubinSlope() <= -20)
        ) {
            this.currentAdvice = this.createAdvice("bloodSample", child)
            return
        }

        //NO FOLLOW UP
        //Negative slope + Under 280 + More than 2 labs
        if (Bilirubin.bilirubinSlope() <= 0 && Bilirubin.lastBilirubin().bilirubinValue < 280 && Bilirubin.numberOfBilirubins >= 2) {
            this.currentAdvice = this.createAdvice("noFollowUp", child)
            return
        }

        //NO ADVICE
        //1 Lab + More/equal 50 from light limit
        if (Bilirubin.numberOfBilirubins == 1) {
            this.currentAdvice = this.createAdvice("noAdvice", child)
            return
        }

        //ERROR
        this.currentAdvice = this.createAdvice("error", child)
        return
    }

    //Create email template for advice feedback
    static  emailReport(child) {

        //To sabla teknisk
        let href = "mailto:hei@sablateknisk.no?subject=Gult barn&body="

        //Autorapport
        href += "%0A%0A%0A%0A"
        href += "AUTOGENERERT RAPPORT:%0A"

        //Tech and clinical version
        href += document.getElementById("tech-version").innerText+ "%0A"
        href += document.getElementById("clinical-version").innerText + "%0A%0A"

        //Advice
        href += "Råd: " + this.currentAdvice.title + "%0A"

        //Description
        href += "Beskrivelse: " + this.currentAdvice.description + "%0A%0A"

        //Child info
        href += "BARNETS INFO:%0A"

        //Add weight class
        if (child.birthWeight < 1000) { href += "Vektklasse:%09%09%09 <1000gram %0A" }
        else if (child.birthWeight < 1500) { href += "Vektklasse:%09%09 1000-1499gram %0A" }
        else if (child.birthWeight < 2500) { href += "Vektklasse:%09%09%09 1500-2499gram %0A" }
        else if (child.birthWeight >= 2500) { href += "Vektklasse:%09%09%09 >=2500gram %0A" }
        else { href += "ukjent"}

        //Add gestational age
        if (child.gestationWeek < 37) {href += "Gestasjonsalder:%09<37uker%0A%0A"}
        else if (child.gestationWeek >= 37) {href += "Gestasjonsalder:%09>=37uker%0A%0A"}

        //Bilirubin info
        href += "BILIRUBIN PRØVER:%0A"
        href += Bilirubin.printBilirubinOverview().replace(/\n/g, '%0A')

        return href



    }

    //Show advice on page
    static displayAdvice(child) {

        if (Advice.currentAdvice != null) {
            //Insert email report in href. //todo only fire href on click
            document.getElementById("feedback-button").children[1].href = this.emailReport(child)

            //Update advice title
            document.getElementById("advice-title").innerHTML = this.currentAdvice.title

            //Update advice description
            document.getElementById("advice-paragraph").innerHTML = this.currentAdvice.description

            //Update advice icon
            document.getElementById("advice-container").style.backgroundImage = `url('${this.currentAdvice.icon}')`;

            //Upadte background color
            document.getElementById("advice-container").style.backgroundColor = `${this.currentAdvice.color}`;

            //Show feedback button
            document.getElementById("feedback-button").classList.remove("hidden")

        }

        //If there is no advice, have it deactivatedelse {
        else {
            this.currentAdvice = Advice.setCurrentAdvice("deactivated")
        }
    }

    //Constructir for each instance
    constructor(advice, title, description, icon, color="var(--advice-container-background)") {
        this.advice = advice
        this.title = title
        this.description = description
        this.icon = icon
        this.color = color
        console.log(this)
    }
}