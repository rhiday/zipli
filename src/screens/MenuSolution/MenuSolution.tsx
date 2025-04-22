import React from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/BottomNav";

export const MenuSolution = (): JSX.Element => {
  const navigate = useNavigate();
  const pastDonations = [
    { id: 1, title: "Food Bank Donation", date: "2024-02-15", amount: "$50" },
    { id: 2, title: "Clothing Drive", date: "2024-02-10", amount: "$30" },
    { id: 3, title: "Emergency Relief", date: "2024-02-05", amount: "$100" },
    { id: 4, title: "Community Support", date: "2024-02-01", amount: "$25" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header with greeting and avatar */}
        <header className="flex justify-between items-center py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-medium">Good afternoon!</h1>
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-[#999999]">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </header>

        {/* Active donations section */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-base font-medium text-muted-foreground mb-3">
            Active Donations
          </h2>
          <Card className="bg-[#fff0f2] border-none">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Current Campaign</h3>
                <p className="text-sm text-muted-foreground">Local Food Bank Support</p>
                <div className="mt-2">
                  <div className="h-2 bg-[#085f33] rounded-full w-3/4"></div>
                </div>
                <p className="text-sm mt-2">75% of goal reached</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-6 sm:my-8" />

        {/* Past donations section */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-base font-medium text-muted-foreground mb-3">
            Past donations
          </h2>
          <div className="grid gap-4">
            {pastDonations.map((donation) => (
              <Card key={donation.id} className="bg-[#fff0f2] border-none">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{donation.title}</h3>
                      <p className="text-sm text-muted-foreground">{donation.date}</p>
                    </div>
                    <span className="font-semibold">{donation.amount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* New Donation button */}
        <div className="fixed bottom-20 right-4 sm:right-8 z-10">
          <Button 
            onClick={() => navigate('/new-donation')}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-[#085f33] text-white rounded-full text-lg hover:bg-[#064726] transition-colors"
          >
            New Donation
          </Button>
        </div>

        <BottomNav />
      </main>
    </div>
  );
};