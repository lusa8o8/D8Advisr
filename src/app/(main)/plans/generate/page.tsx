import Screen08PlanGenerator from "@/components/screens/Screen08PlanGenerator";

type GeneratePageProps = {
  searchParams: {
    venueId?: string;
  };
};

export default function PlanGeneratorPage({ searchParams }: GeneratePageProps) {
  return <Screen08PlanGenerator initialVenueId={searchParams.venueId} />;
}
