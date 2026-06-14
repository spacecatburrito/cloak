import { Container } from "@/components/site";

const AUDIENCES: { icon: string; title: string; body: string }[] = [
  {
    icon: "🗞️",
    title: "Independent media & journalists",
    body: "Fund reporting your government bans, without joining a list of its enemies.",
  },
  {
    icon: "⚖️",
    title: "Human rights & political prisoners",
    body: 'Support detainees and rights groups even where it is branded "extremism."',
  },
  {
    icon: "🏳️‍🌈",
    title: "LGBTQ+ communities",
    body: "Back queer people where they are criminalised - Korrin, Ardenia, or under Norvelia's \"extremist\" LGBT ban - without exposing yourself.",
  },
  {
    icon: "✊",
    title: "Reproductive rights",
    body: "Give to abortion and reproductive-health funds where helping is treated as aiding a crime.",
  },
  {
    icon: "🕊️",
    title: "Humanitarian aid in conflict & sanctioned zones",
    body: 'Send relief to civilians in war or sanctioned regions without a trail that reads as "material support."',
  },
  {
    icon: "🛐",
    title: "Persecuted faiths & beliefs",
    body: "Support banned religious communities - like groups labelled 'extremist' - without becoming a target yourself.",
  },
];

export function WhoFor() {
  return (
    <Container id="who" className="scroll-mt-20 py-12">
      <h2 className="font-display text-3xl font-light tracking-tight">Who Cloak is for</h2>
      <p className="mt-3 max-w-2xl text-muted">
        Anywhere generosity can be used against you - or against the people you are trying
        to help.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIENCES.map((a) => (
          <div key={a.title} className="rounded-2xl border border-border bg-surface p-6">
            <span aria-hidden className="text-2xl">
              {a.icon}
            </span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{a.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{a.body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
