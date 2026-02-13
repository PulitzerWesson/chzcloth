 // betExamples.js - Library of good and bad bet examples

export const betExamples = {
  goal: {
    intro: "Strong goals are specific and measurable:",
    good: [
      {
        text: "Increase monthly recurring revenue from $100k to $150k in Q2",
        why: "Specific numbers, clear timeframe"
      },
      {
        text: "Reduce customer churn from 8% to 5% this quarter",
        why: "Measurable baseline and target"
      },
      {
        text: "Improve trial-to-paid conversion from 12% to 18% in 90 days",
        why: "Clear metric with timeline"
      }
    ],
    bad: [
      {
        text: "Make more money",
        why: "Too vague - how much? by when?"
      },
      {
        text: "Improve the product",
        why: "Not measurable - improve what specifically?"
      }
    ]
  },

  change: {
    intro: "Strong bets are specific about WHAT changes:",
    good: [
      {
        text: "Add 5 video testimonials from enterprise customers to our pricing page, above the fold",
        why: "Specific: what (videos), how many (5), who (enterprise), where (pricing page)"
      },
      {
        text: "Reduce onboarding from 7 steps to 3 steps by removing email verification and profile setup",
        why: "Specific about what's changing and what's being removed"
      },
      {
        text: "Add real-time collaboration feature allowing 2-5 users to edit the same document simultaneously",
        why: "Specific feature with clear scope"
      }
    ],
    bad: [
      {
        text: "Improve trust",
        why: "How? Trust is an outcome, not a change"
      },
      {
        text: "Make the product better",
        why: "What specifically will change?"
      },
      {
        text: "Add social proof",
        why: "What kind? Where? How much?"
      }
    ]
  },

  baseline: {
    intro: "Strong baselines are specific numbers you can measure:",
    good: [
      {
        text: "Current: 45 trial signups/week converting at 8% = 3.6 paid customers/week (measured in Stripe)",
        why: "Specific numbers with measurement tool"
      },
      {
        text: "Current: 22% of users complete onboarding. We have 200 signups/month, so 44 activated users/month (PostHog data)",
        why: "Percentage AND absolute numbers"
      },
      {
        text: "Current: 127 support tickets/month about feature X, averaging 45min each = 95 hours/month (Zendesk)",
        why: "Quantified problem with cost"
      }
    ],
    bad: [
      {
        text: "Not many customers",
        why: "How many exactly?"
      },
      {
        text: "Things aren't working well",
        why: "What specific metric?"
      },
      {
        text: "Unknown",
        why: "Can't measure improvement without baseline"
      }
    ]
  },

  prediction: {
    intro: "Strong predictions are realistic and tied to mechanism:",
    good: [
      {
        text: "From 8% to 12% trial conversion in 90 days (need full cohort to mature). That's 5.4 paid customers/week vs 3.6 currently.",
        why: "Specific numbers, realistic timeline explained, absolute impact calculated"
      },
      {
        text: "From 127 tickets/month to 40 tickets/month within 30 days of deployment (immediate impact once fix is live)",
        why: "Timeline justified by mechanism"
      },
      {
        text: "From 10 customers/month to 15 customers/month in 60 days (time for prospects to see testimonials + sales cycle)",
        why: "Timeline accounts for behavior change + sales process"
      }
    ],
    bad: [
      {
        text: "Things will get much better",
        why: "How much better? By when?"
      },
      {
        text: "We'll double revenue in 2 weeks",
        why: "Unrealistic timeline for that magnitude"
      },
      {
        text: "More customers",
        why: "How many more? From what baseline?"
      }
    ]
  },

  validation: {
    intro: "Strong bets have evidence, not just opinions:",
    good: [
      {
        text: "We interviewed 20 customers. Top complaint was lack of real-time collaboration (mentioned by 18/20). When asked 'would you upgrade for this feature?', 14 said yes, 9 said they'd pay 30% more.",
        why: "Specific research with quantified interest"
      },
      {
        text: "Ran a fake door test on pricing page. 412 visitors, 89 clicked 'Try Collaboration' (21.6% CTR). Emailed them - 22 replied saying they'd been waiting for this.",
        why: "Measured actual behavior, not stated intent"
      },
      {
        text: "Competitor Notion added this in Q2 2024. Their published case study showed 34% increase in team plan conversions. Our audience is similar (B2B SaaS teams).",
        why: "Real market data from comparable company"
      },
      {
        text: "Analytics show 2,847 users tried to invite collaborators last month but couldn't (event: 'invite_clicked_on_solo_plan'). 412 clicked upgrade prompt but bounced when they saw collaboration wasn't included.",
        why: "Behavioral data showing frustrated demand"
      }
    ],
    bad: [
      {
        text: "Our team thinks this is a good idea",
        why: "Opinion, not evidence"
      },
      {
        text: "Customers seem frustrated",
        why: "Vague feeling, not validated"
      },
      {
        text: "We should have this feature",
        why: "Assumes rather than proves need"
      }
    ]
  },

  cheaperTest: {
    intro: "Strong bets test cheap before building expensive:",
    good: [
      {
        text: "Before building testimonials feature ($62k, 8 weeks), we'll manually create 5 video testimonials with existing customers ($3k for videographer, 2 weeks). Add them to pricing page and measure conversion for 30 days. If we see 15%+ lift, build the feature.",
        why: "Manual MVP, clear success metric, fraction of cost"
      },
      {
        text: "Before redesigning entire onboarding ($80k, 10 weeks), we'll run 15 moderated user tests ($4k, 1 week) to see exactly where people get stuck. This tells us what to fix without guessing.",
        why: "Research first, build second"
      },
      {
        text: "Before building referral program ($50k, 6 weeks), we'll manually offer $50 to first 30 customers who successfully refer someone. See if anyone actually does it. If <5 referrals, the problem isn't the tool - it's the incentive.",
        why: "Tests core assumption before automating"
      },
      {
        text: "Before building integration ($40k, 5 weeks), we'll create Zapier workflow (2 hours) and see if 10 customers use it. If yes, build native integration. If no, saved $40k.",
        why: "Low-code test of demand"
      }
    ],
    bad: [
      {
        text: "We'll build it and see what happens",
        why: "No test, just risk"
      },
      {
        text: "Can't test this without building it",
        why: "Almost everything can be tested cheaper"
      },
      {
        text: "We need the full feature",
        why: "Usually you can test the core assumption"
      }
    ]
  },

  effort: {
    intro: "Be realistic about effort:",
    guidelines: [
      "1 sprint (2 weeks): Small improvements, config changes, simple features",
      "2-3 sprints (4-6 weeks): New features with known patterns",
      "4-6 sprints (8-12 weeks): Complex features, new infrastructure",
      "6+ sprints (12+ weeks): Major initiatives, platform changes"
    ],
    reality_check: [
      "If it involves new infrastructure → probably 4+ sprints",
      "If it's 'just a small change' → probably 2-3 sprints (nothing is small)",
      "If you've never built something like this → add 50% to estimate"
    ]
  }
};

// Helpers to get random examples
export const getGoodExample = (category) => {
  const examples = betExamples[category]?.good || [];
  return examples[Math.floor(Math.random() * examples.length)];
};

export const getBadExample = (category) => {
  const examples = betExamples[category]?.bad || [];
  return examples[Math.floor(Math.random() * examples.length)];
};

export const getExamples = (category, count = 3) => {
  const examples = betExamples[category]?.good || [];
  return examples.slice(0, count);
};
