import { ReactNode } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../lib/theme';
import { ScreenTransition } from '../components/ScreenTransition';

const POINTS_TABLE: { card: string; points: string }[] = [
  { card: 'Ess i trumf (kan inte tas över)', points: '1 p' },
  { card: 'Tvåan i trumf (kan inte tas över)', points: '1 p' },
  { card: 'Knekt i trumf', points: '1 p' },
  { card: 'Tia i trumf', points: '1 p' },
  { card: 'Femma i trumf (Pidro)', points: '5 p' },
  { card: 'Femma i motsvarande färg (Pidro)', points: '5 p' },
];

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTransition style={styles.content}>
          <Text style={styles.title}>Spelregler</Text>

          <Section title="Spelare och kort">
            <Paragraph>
              Pidro spelas alltid av 4 spelare i 2 lag. Man sitter snett emot sin partner, det vill säga att man
              alltid har en motståndare bredvid sig. Man använder en vanlig kortlek med 52 kort.
            </Paragraph>
          </Section>

          <Section title="Given">
            <SubSection title="Vem delar">
              <Paragraph>
                Förste kortgivare utses genom lottdragning. Därefter går turen att dela alltid medsols runt bordet,
                ett varv i taget till nästa spelare.
              </Paragraph>
            </SubSection>
            <SubSection title="Avstyrning">
              <Paragraph>
                Innan given delas ut ska motståndaren till höger om den delande spelaren alltid putta (avstyra)
                kortleken.
              </Paragraph>
            </SubSection>
            <SubSection title="Utdelning">
              <Paragraph>
                Varje spelare får 9 kort. Utdelningen börjar med spelaren till vänster om delaren och går sedan
                medsols. Korten delas ut i tre omgångar om 3 kort åt gången (dvs. varje spelare får 3 kort, sedan
                ytterligare 3, och slutligen ytterligare 3, tills alla har 9 kort).
              </Paragraph>
            </SubSection>
            <SubSection title="Talong" last>
              <Paragraph>Resterande kort som blir över efter utdelningen läggs i en talong som hålls av den som delade ut korten.</Paragraph>
            </SubSection>
          </Section>

          <Section title="Budgivning">
            <Paragraph>
              Spelarna bjuder i tur och ordning på hur många poäng de tror att de kan ta hem under given. Ett bud
              kan vara lägst 6 och högst 14 poäng. Den som inte vill bjuda säger pass. Varje nytt bud måste vara
              högre än föregående bud; man får alltså inte bjuda samma poäng som en tidigare spelare redan bjudit.
            </Paragraph>
            <Paragraph>
              Undantag: delaren har alltid rätt att ta budet på 14 poäng, även om en annan spelare redan bjudit 14.
            </Paragraph>
            <Paragraph>
              Om ingen spelare lägger något bud är delaren tvingad att spela som om denne bjudit 6 poäng, i valfri
              trumf-färg.
            </Paragraph>
            <Paragraph last>Den som bjuder högst väljer trumf-färg och leder första sticket.</Paragraph>
          </Section>

          <Section title="Trumf och poängkort">
            <Paragraph>Endast trumf-färgen räknas för poäng. I trumf finns dessa poänggivande kort:</Paragraph>
            <PointsTable />
            <Paragraph>
              Motsvarande färg avgörs alltså av färgparet: är trumf hjärter är motsvarande färg ruter (och vice
              versa); är trumf spader är motsvarande färg klöver (och vice versa).
            </Paragraph>
            <Paragraph>Totalt finns alltså 14 poäng att slåss om varje giv.</Paragraph>
            <Paragraph>
              Ess och tvåan i trumf kan aldrig tas av något annat kort — dessa poäng är alltid säkra för den
              spelare som lade ut kortet, oavsett vad övriga spelare svarar med.
            </Paragraph>
            <Paragraph last>
              Om båda Pidrorna (femman i trumf och femman i motsvarande färg) spelas i samma stick vinner alltid
              den Pidro som är i trumf.
            </Paragraph>
          </Section>

          <Section title="Kortbyte efter budgivningen">
            <Paragraph>
              När budet är klart slänger alla spelare utom delaren sina kort som inte är i trumf. Pidron i
              motsvarande färg räknas som trumf i detta sammanhang och ska alltså också behållas på handen, trots
              att den formellt inte tillhör trumf-färgen. De bortlagda korten läggs med bildsidan nedåt, skilda för
              sig vid varje spelares högra sida.
            </Paragraph>
            <Paragraph>
              Spelarna får sedan tilldelat nya kort från talongen så att var och en har 6 kort på handen, så långt
              korten räcker. Delaren är undantagen från regeln om att bara behålla trumf och behöver bara se till
              att ha minst 6 kort på handen. Delaren behåller istället alla kort som blir kvar i talongen. Delaren
              får inte avslöja eller ge några ledtrådar om hur många trumfar denne har på handen.
            </Paragraph>
            <Paragraph last>
              Om en spelare har fler än 6 trumfar (inklusive pidron i motsvarande färg) på handen måste denne,
              innan omgångens första stick, "döda" så många poänglösa trumfkort som behövs för att komma ner till 6
              kort på handen, och samtidigt meddela övriga spelare om detta. Endast poänglösa kort får dödas på
              detta sätt — ett poänggivande kort får aldrig läggas bort. De dödade korten läggs synliga med
              bildsidan uppåt och är därefter helt ur spel för resten av given.
            </Paragraph>
          </Section>

          <Section title="Spelets gång">
            <Paragraph>
              Given som vann budgivningen leder ut ett kort i den valda trumf-färgen. Båda Pidrorna räknas som
              trumf i detta sammanhang, så övriga spelare måste följa med endera Pidron eller ett annat trumfkort
              om de kan.
            </Paragraph>
            <Paragraph>
              Spelet går medsols. Den som lägger högsta trumfkortet i sticket vinner sticket och de poängkort som
              ingick. Undantaget är tvåan i trumf, vars poäng alltid tillfaller den spelare som lade ut den — oavsett
              vem som vinner sticket.
            </Paragraph>
            <Paragraph last>
              Vinnaren av ett stick leder även nästa stick. Om denna spelare inte längre har något trumfkort kvar
              är det istället spelaren till vänster om vinnaren som leder ut.
            </Paragraph>
            <SubSection title="När man saknar spelbara kort" last>
              <Paragraph>
                Om en spelare inte längre har några trumfar eller Pidron kvar på handen när det är dennes tur,
                slänger spelaren resterande kort på bordet med bildsidan nedåt. Detta får bara göras just den tur
                då spelaren inte längre har något kort att spela, och man får inte i förväg meddela att man saknar
                spelbara kort innan det är ens tur. Har spelaren däremot fortfarande ett spelbart kort kvar (t.ex.
                om denne precis lade ut sin sista trumf) håller spelaren kvar övriga kort på handen till nästa tur.
              </Paragraph>
            </SubSection>
          </Section>

          <Section title="Poängräkning">
            <Paragraph>
              Laget som vann budgivningen måste ta hem minst lika många poäng som man bjöd — annars går laget back
              med lika många poäng som budet var (oavsett hur många poäng laget faktiskt tog hem) och hamnar i
              "Håla".
            </Paragraph>
            <Paragraph>
              Undantag: om delaren använt sin specialrätt att ta budet på 14 (se Budgivning) och laget sedan inte
              klarar kontraktet, blir straffet istället -28 poäng.
            </Paragraph>
            <Paragraph last>Det andra laget får alla poäng de faktiskt tar hem.</Paragraph>
            <SubSection title="Fusk och misstag" last>
              <Paragraph>
                Om en spelare fuskar eller gör ett misstag (t.ex. avslöjar i förväg att man saknar kort i trumf,
                eller lägger ut fel kort) får den missgynnade parten 14 poäng i kompensation. Gör samma spelare om
                fusket eller misstaget igen under samma match får den missgynnade parten istället 62 poäng, vilket
                innebär omedelbar vinst för den parten.
              </Paragraph>
            </SubSection>
          </Section>

          <Section title="Vinst" last>
            <Paragraph>
              Målpoängen är 62 poäng. Första laget som når (eller passerar) 62 poäng vinner spelet.
            </Paragraph>
            <Paragraph last>
              Specialregel vid samtidig målgång: Om båda lagen skulle nå eller passera 62 poäng under samma varv
              (t.ex. det bjudande laget tar hem sina poäng och når 62+, samtidigt som motståndarlaget också hamnar
              på 62+ tack vare sina poäng från samma giv), så är det budgivande laget som vinner spelet — oavsett
              vilket lag som faktiskt har högst slutgiltig poängsumma.
            </Paragraph>
          </Section>
        </ScreenTransition>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, last && styles.sectionLast]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SubSection({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.subSection, last && styles.subSectionLast]}>
      <Text style={styles.subSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children, last }: { children: ReactNode; last?: boolean }) {
  return <Text style={[styles.paragraph, !last && styles.paragraphSpacing]}>{children}</Text>;
}

function PointsTable() {
  return (
    <View style={styles.table}>
      {POINTS_TABLE.map((row, i) => (
        <View key={row.card} style={[styles.tableRow, i === POINTS_TABLE.length - 1 && styles.tableRowLast]}>
          <Text style={styles.tableCard}>{row.card}</Text>
          <Text style={styles.tablePoints}>{row.points}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  content: { gap: 4 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.ink, marginHorizontal: 2, marginBottom: 16 },
  section: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.cardLg,
    padding: 18,
    marginBottom: 14,
    ...shadows.card,
  },
  sectionLast: { marginBottom: 0 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.feltGreen, marginBottom: 10 },
  subSection: { marginTop: 14 },
  subSectionLast: {},
  subSectionTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, marginBottom: 6 },
  paragraph: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.muted },
  paragraphSpacing: { marginBottom: 10 },
  table: {
    backgroundColor: colors.inset,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 10,
  },
  tableRowLast: { borderBottomWidth: 0 },
  tableCard: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  tablePoints: { fontFamily: fonts.bold, fontSize: 13, color: colors.feltGreen, fontVariant: ['tabular-nums'] },
});
