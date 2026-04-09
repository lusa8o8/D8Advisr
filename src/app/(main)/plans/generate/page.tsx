import Screen08PlanGenerator from "@/components/screens/Screen08PlanGenerator";

type GeneratePageProps = {
  searchParams: {
    venue_id?: string;
    venue_name?: string;
  };
};

export default function PlanGeneratorPage({ searchParams }: GeneratePageProps) {
  return <Screen08PlanGenerator initialVenueId={searchParams.venue_id} />;
}
