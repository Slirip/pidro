import { ReactNode } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../lib/theme';
import { ScreenTransition } from '../components/ScreenTransition';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTransition style={styles.content}>
          <Text style={styles.title}>Integritetspolicy</Text>

          <Section title="Datainsamling">
            <Paragraph>
              Pidro samlar inte in, överför eller delar någon personlig data. Appen har ingen backend-server, ingen
              analys, ingen reklam och ingen nätverksåtkomst av något slag.
            </Paragraph>
          </Section>

          <Section title="Datalagring">
            <Paragraph>
              All speldata — aktiva matcher, poäng och matchhistorik — lagras lokalt på din enhet med
              standardlagring på enheten (AsyncStorage). Denna data lämnar aldrig din enhet, överförs aldrig
              någonstans och är endast tillgänglig för dig. Om du raderar appen raderas denna data.
            </Paragraph>
          </Section>

          <Section title="Tredje part">
            <Paragraph>Pidro integrerar inte med några tredjepartstjänster, SDK:er eller spårare.</Paragraph>
          </Section>

          <Section title="Barns integritet">
            <Paragraph>
              Eftersom Pidro inte samlar in någon data alls, samlar appen inte medvetet in data från barn eller
              någon annan.
            </Paragraph>
          </Section>

          <Section title="Ändringar av denna policy">
            <Paragraph last>
              Om denna policy ändras (till exempel om en framtida version av appen lägger till funktionalitet som
              involverar datainsamling) kommer denna sida att uppdateras i enlighet med detta.
            </Paragraph>
          </Section>

          <Section title="Kontakt" last>
            <Paragraph last>
              Frågor om denna policy kan skickas till filip.westergard@gmail.com.
            </Paragraph>
          </Section>

          <View style={styles.divider} />

          <Text style={styles.title}>Privacy Policy</Text>

          <Section title="Data collection">
            <Paragraph>
              Pidro does not collect, transmit, or share any personal data. The app has no backend server, no
              analytics, no advertising, and no network access of any kind.
            </Paragraph>
          </Section>

          <Section title="Data storage">
            <Paragraph>
              All game data — active matches, scores, and match history — is stored locally on your device using
              standard on-device storage (AsyncStorage). This data never leaves your device, is never transmitted
              anywhere, and is only accessible to you. Deleting the app deletes this data.
            </Paragraph>
          </Section>

          <Section title="Third parties">
            <Paragraph>Pidro does not integrate with any third-party services, SDKs, or trackers.</Paragraph>
          </Section>

          <Section title="Children's privacy">
            <Paragraph>
              Since Pidro collects no data of any kind, it does not knowingly collect data from children or anyone
              else.
            </Paragraph>
          </Section>

          <Section title="Changes to this policy">
            <Paragraph last>
              If this policy changes (for example, if a future version of the app adds functionality that involves
              data collection), this page will be updated accordingly.
            </Paragraph>
          </Section>

          <Section title="Contact" last>
            <Paragraph last>Questions about this policy can be sent to filip.westergard@gmail.com.</Paragraph>
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

function Paragraph({ children, last }: { children: ReactNode; last?: boolean }) {
  return <Text style={[styles.paragraph, !last && styles.paragraphSpacing]}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  content: { gap: 4 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.ink, marginHorizontal: 2, marginBottom: 16 },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: 20,
    marginHorizontal: 2,
  },
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
  paragraph: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.muted },
  paragraphSpacing: { marginBottom: 10 },
});
