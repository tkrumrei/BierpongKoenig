// Telgter Bier Gesetz (TBG) in der Fassung vom 06.01.2023
export interface RuleSection {
  id: number
  title: string
  paragraphs: (string | { text: string; items: string[] })[]
}

export const TBG_VERSION = 'in der Fassung vom 06.01.2023'

export const TBG: RuleSection[] = [
  {
    id: 1,
    title: 'Personenkreis',
    paragraphs: [
      'Dieses Gesetz betrifft insbesondere Personen aus der Gruppe der 6 Saufsünden, namentlich Theresa Bürdemann, Lara Strohbücker, Patrick Leifeld, Linus Westerhoff, Tobias Krumrein sowie René Spyrka.',
      'Dieses Gesetz ist ebenso auf jede weitere Person anwendbar.',
    ],
  },
  {
    id: 2,
    title: 'Begriffsbestimmungen',
    paragraphs: [
      'Ein Schnaps ist ein Shot mit mindestens 14 % Volumen.',
      'Bier ist ein Getränk aus Brauwasser, Malz, Hopfen und Hefe.',
    ],
  },
  {
    id: 3,
    title: 'Bierquälerei',
    paragraphs: [
      {
        text: 'Bierquälerei ist jede Handlung, die dem Bier sowie der Bierflasche als auch dem Bierglas Schaden zufügt. Darunter fallen insb.',
        items: ['das Verschütten eines Bieres,', 'das Zerbrechen einer Flasche,', 'das Zerbrechen eines Glases.'],
      },
      'Bei Streitigkeiten wird durch alle Zeugen der vermeintlichen Bierquälerei mehrheitlich entschieden.',
    ],
  },
  {
    id: 4,
    title: 'Bierpong',
    paragraphs: [
      'Beim Bierpong treten zwei Teams gegeneinander an. Es wird mit sechs oder zehn Bechern pro Team gespielt. Ein Team besteht aus mindestens einer und höchstens zwei Personen. Bei zehn Bechern darf das Team auch aus drei Personen bestehen. Ein 0,33 l Bier entspricht in der Regel drei Becher.',
      'Der Spieltisch ist in der Regel der Tisch einer Bierzeltgarnitur. Die Spielbälle sind in der Regel Tischtennisbälle.',
      'Beim Werfen des Balles muss sich der Ellenbogen hinter der Tischkante befinden.',
      'Ein Aufsetzer ist das Aufprallen des Balles auf den Tisch. Bei einem erfolgreichen Aufsetzer muss die Anzahl der Tischberührungen zusätzlich zum Treffer getrunken werden. Demnach müssen bei einem doppelten Aufsetzer drei Becher getrunken werden. Die zu trinkenden Becher sind von dem Gegnerteam zu bestimmen mit Ausnahme des getroffenen Bechers.',
      'Das Treffen beider Bälle in denselben Becher führt zum Trinken von drei Bechern. Absatz 4 Satz 4 gilt entsprechend.',
      'Beim Treffen beider Bälle gilt Balls-Back.',
      'Ein Trickshot zählt lediglich als einfacher Treffer. Das Zuhalten der Augen ist kein Trickshot. Bei der Aufnahme eines zurückrollenden Balles muss im Anschluss ein Trickshot geworfen werden.',
      'Während des Spiels mit sechs Bechern hat jedes Team die Möglichkeit die Becher einmal umzustellen. Bei einem Spiel mit zehn Bechern darf zweimal umgestellt werden. Beim Umstellen muss darauf geachtet werden, dass höchstens drei Becher in einer Reihe stehen. Eine Reihe aus vier oder mehr Bechern ist nicht gestattet.',
      'Das Stapeln der Becher ineinander ist nicht gestattet. Beim Vergehen dieser Regelung ist derjenige, der dies getan hat, verpflichtet die Becher zu spülen.',
    ],
  },
  {
    id: 5,
    title: 'Sonderregeln des Bierpongs',
    paragraphs: [
      'Ein Gastwurf eines Externen, nicht Integrierten der aktuellen Runde, darf ausgeführt werden, solange das jeweilige Team dies verlangt. Der Gastwurf einer Person ist nicht zweimal hintereinander möglich.',
      'Wird der Becher getroffen aus dem ein Spieler der aktuellen Runde trinkt, der sog. Todesbecher, so ist das Spiel direkt vorbei und das Team, welches den Todesbecher getroffen hat, gewinnt.',
      'Jeder Spieler muss in einer Spielrunde mindestens einen gegnerischen Becher treffen.',
      'Die On-Fire Regelung gem. § 9 dieses Gesetzes gilt entsprechend.',
    ],
  },
  {
    id: 6,
    title: 'Starten und Ende der Bierpongrunde',
    paragraphs: [
      'Welches Team bei einer Runde startet entscheidet das Schnick, Schnack, Schnuck - Spiel. Das Team, welches das Spiel gewinnt, darf entscheiden welches Team beginnt.',
      'Nur jeweils ein Teammitglied des Teams darf an dem Spiel teilnehmen. Wer dies ist bestimmt das Team selbst.',
      'Wenn sich die beiden Parteien vor dem Schnick, Schnack, Schnuck - Spiel darauf einigen beim ersten Mal die Schere zu benutzen, die sog. Ehrenschere, dann ist dies bindend. Wird die Ehrenschere missachtet, so gilt dies als Niederlage. Das Anwenden dieser Vorgehensweise muss vor dem Spiel ausdrücklich oder konkludent von beiden Teams erwähnt werden. Spielen zwei Mitglieder der 6 Saufsünden gegeneinander ist die Ehrenschere verpflichtend.',
      'Nachdem das Schnick, Schnack, Schnuck - Spiel vollständig ausgetragen wurde, ist es für die aktiv teilnehmenden Mitspieler untersagt bis zum Ende der Runde auf Toilette zu gehen.',
      'Das Ende der Runde tritt ein, wenn ein Team den letzten Becher des gegnerischen Teams trifft. Das andere Team hat immer den Anspruch auf einen Nachwurf mit beiden Bällen mit Ausnahme des Abs. 6.',
      'Wird ein Spiel mit dem Treffen beider Bälle beendet, so entsteht kein Anspruch auf einen Nachwurf.',
    ],
  },
  {
    id: 7,
    title: 'Verlängerung der Bierpongrunde',
    paragraphs: [
      'Sollte das Team mit dem Nachwurf ebenfalls alle Becher des anderen Teams treffen, so kommt es zur Verlängerung. § 6 Abs. 6 gilt entsprechend. In der Verlängerung bekommt jedes Team erneut drei Becher zugeteilt. Die Regeln der regulären Spielzeit gelten entsprechend.',
    ],
  },
  {
    id: 8,
    title: 'Trinken des Bierpong-Bieres',
    paragraphs: [
      'Grundsätzlich muss das zu trinkende Bier bei einem Zweierteam zwischen den beiden Teampartnern gerecht aufgeteilt werden. Andere Abstimmungen innerhalb des Teams sind zulässig.',
      'Jeder, der zum Bierpong antritt, wird verpflichtet das nach Abs. 1 zu trinkende Bier zu trinken. Abs. 3 bleibt unberührt.',
      'Muss sich eine Person während der Runde übergeben, so ist sie vom Trinken des Bieres in dieser Runde freigestellt. Der Teampartner wird dazu verpflichtet das gesamte übrige Bier zu trinken. Außenstehende Personen können in diesem Fall helfen.',
      'Bevor ein Spieler eine neue Runde Bierpong bestreiten möchte, muss er zunächst sein gesamtes Bier der vorherigen Runde getrunken haben.',
    ],
  },
  {
    id: 9,
    title: 'On-Fire Regelung',
    paragraphs: [
      {
        text: 'Die On-Fire Regelung gliedert sich in die folgenden drei Stufen:',
        items: [
          'Der erste Treffer hat noch keine besonderen Auswirkungen.',
          'Bei einem zweiten Treffer hintereinander muss der Ausdruck „Heaten-Up“ verwendet werden damit es zur dritten Stufe dieser Regelung kommen kann. Ein konkludentes Verhalten genügt hier nicht.',
          'Bei einem dritten Treffer hintereinander muss der Ausdruck „On-Fire“ verwendet werden damit diese Regelung greift. Ein konkludentes Verhalten genügt hier nicht.',
        ],
      },
      'Werden alle drei Stufen erfüllt, so ist es dem Erfüller gestattet so lange ununterbrochen weiter zu werfen bis dieser sich einen Fehlwurf leistet.',
    ],
  },
  {
    id: 10,
    title: 'Rage Cage',
    paragraphs: [
      'Beim Rage Cage werden mind. zehn Becher, gefüllt mit Bier, in die Mitte eines Tisches gestellt. Zwei leere Becher und zwei Tischtennisbälle werden an den Rand gestellt. Zwei Spieler, die sich gegenüber stehen nehmen jeweils einen der leeren Becher zusammen mit jeweils einem Tischtennisball.',
      'Um das Spiel zu starten müssen sich die Tischtennisbälle einmal berühren.',
      'Wenn ein Ball nach einem Aufsetzer in den Becher trifft, muss der Becher zusammen mit dem Ball eine Person nach links gegeben werden. Steht der andere Spielbecher links daneben, so muss der Spieler den getroffenen Becher in diesen stellen. Der eingeholte Spieler muss einen Becher aus der Mitte trinken und mit diesem weiterspielen.',
      'Wenn der Becher beim ersten Versuch getroffen wird, so hat der Spieler freie Auswahl wo er den Becher hinstellen will. Es ist nicht zulässig den Becher direkt in den anderen Spielbecher zu stellen. Das Stellen vor den anderen Becher ist erlaubt, unabhängig davon, ob der Spieler die Möglichkeit hatte den Ball zu werfen.',
      'Wird bei einem Wurf ein Becher in der Mitte getroffen, so hat der werfende Spieler den getroffenen Becher zu leeren, um weiterspielen zu können.',
      'Fällt ein Ball runter, so ist das Spiel nicht zu unterbrechen. Die Ausnahme gilt, wenn der Ball unverhältnismäßig weit weg ist. Danach gilt Abs. 2 entsprechend.',
      'Muss ein Spieler einen Becher trinken, darf dies kein Mitspieler für ihn übernehmen.',
      'Muss ein Spieler unverhältnismäßig viele Becher trinken, so hat er das Recht das Bier in einem Becher zu stapeln. Ein zweiter Becher zum Stapeln ist unzulässig. Ein Verstoß führt zum Ausschluss aus der aktuellen Spielrunde.',
      'Das Spiel ist beendet, sobald alle Becher aus der Mitte getrunken wurden.',
    ],
  },
  {
    id: 11,
    title: 'Regelung über die Zahlung des Bieres',
    paragraphs: [
      'Grundsätzlich ist jeder, der in § 1 genannten Personen, dazu verpflichtet das Bier für gemeinsame Abende zu kaufen. Bevorzugt kauft allerdings der jeweilige Gastgeber des Abends das Bier. Davon kann allerdings abgesehen werden, wenn zeitliche oder andere organisatorische Gründe dem entgegenstehen.',
      'Der Gesamtpreis exkl. Pfand des Bieres wird durch die anwesenden Personen gerecht geteilt. Dies gilt auch für Personen, die nicht in § 1 genannt sind. Eine Ausnahme dieses Absatzes besteht, falls jemand der anwesenden Personen an dem jeweiligen Abend keinen Alkohol trinkt oder eine Person erheblich später kommt.',
      'Das Pfand wird von demjenigen bezahlt, der auch das Leergut zurückbringt. Die anderen Personen können demjenigen allerdings eine Aufwandsentschädigung zukommen lassen.',
      'Die bevorzugte Zahlungsmethode ist PayPal. Dementsprechend ist jeder, der in § 1 genannten Personen, dazu verpflichtet ein PayPal-Konto zu haben. Allerdings sollte die Zahlung durch Bargeld auch jederzeit möglich sein.',
      'In besonderen Fällen kann sich einer, der in § 1 genannten Personen, dazu bereit erklären die gesamten Kosten des Abends zu übernehmen.',
      'Die Frist zur Zahlung beträgt 7 Tage nach Ablauf des Abends. Wird diese Frist nicht eingehalten, so können die anderen Personen eine Entschädigung in Form eines Kastens oder einer Schnapsflasche fordern. Bei Streitentscheidungen gelten die §§ 187 ff. BGB.',
    ],
  },
  {
    id: 12,
    title: 'Art des Bieres',
    paragraphs: [
      'Beim Kauf des Bieres, gem. § 11 Abs. 1 dieses Gesetzes, muss auf einen sparsamen Umgang mit Geld geachtet werden. Dementsprechend gilt der Grundsatz, dass in der Regel Bier im Angebot gekauft werden muss. Dies gilt insb. dann, wenn eine Menge von mehr als zwei Kisten gekauft wird.',
      'Von Abs. 1 kann abgesehen werden, wenn zu dem jeweiligen Zeitpunkt kein genießbares Bier im Angebot ist. Welches Bier genießbar ist, entscheidet eine demokratische Abstimmung unter den anwesenden Personen des Abends.',
      'Tritt § 11 Abs. 5 dieses Gesetzes ein, so gilt Abs. 1 nicht.',
    ],
  },
  {
    id: 13,
    title: 'Monatsbeitrag',
    paragraphs: [
      'Jeder, der in § 1 Abs. 1 namentlich genannten Personen, muss einen Monatsbeitrag in Höhe von 5,- € auf das Saufsünden-PayPal-Konto bezahlen.',
      'Der Monatsbeitrag ist bis zum 7. des jeweiligen Monats zu zahlen.',
    ],
  },
  {
    id: 14,
    title: 'Strafen-Katalog',
    paragraphs: [
      {
        text: 'Strafbar handelt, wer vorsätzlich oder fahrlässig gegen eine Vorschrift über',
        items: [
          'die Bierquälerei nach § 3, 2 €,',
          'die Sonderregel des Bierpongs nach § 5 Abs. 3, 2 €,',
          'die Toilettenregelung nach § 6 Abs. 4, 2 €,',
          'das Trinken des Bierpong-Bieres nach § 8 Abs. 2, 5 €,',
          'das Trinken des Bierpong-Bieres nach § 8 Abs. 4, 5 €,',
        ],
      },
      {
        text: 'verstößt. Strafbar handelt weiterhin, wer',
        items: [
          'ohne vorherige Abmeldung mit Zeitangabe, wann man bei dem Treffen erscheinen wird (mind. 3 Stunden zuvor), zu spät zu einem Treffen erscheint, 1 € pro 10 Minuten,',
          'unabgemeldet nicht zu einem Treffen erscheint, 20 €,',
          'bei einer Veranstaltung rausfliegt, 10 €,',
          'den Monatsbeitrag zu spät überweist, 1 € pro Tag.',
        ],
      },
      '§ 13 Abs. 2 gilt entsprechend.',
    ],
  },
  {
    id: 15,
    title: 'Inkrafttreten',
    paragraphs: ['Dieses Gesetz tritt mit sofortiger Wirkung in Kraft.'],
  },
]
