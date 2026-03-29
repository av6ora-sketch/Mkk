import { useLanguage } from "../../contexts/LanguageContext";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Subscriptions() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('subscriptions.free'),
      price: "$0",
      period: t('subscriptions.month'),
      description: t('subscriptions.freeDesc'),
      features: [
        t('subscriptions.freeFeature1'),
        t('subscriptions.freeFeature2'),
        t('subscriptions.freeFeature3'),
        t('subscriptions.freeFeature4')
      ],
      buttonText: t('subscriptions.currentPlan'),
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: t('subscriptions.pro'),
      price: "$19",
      period: t('subscriptions.month'),
      description: t('subscriptions.proDesc'),
      features: [
        t('subscriptions.proFeature1'),
        t('subscriptions.proFeature2'),
        t('subscriptions.proFeature3'),
        t('subscriptions.proFeature4'),
        t('subscriptions.proFeature5')
      ],
      buttonText: t('subscriptions.upgradePro'),
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: t('subscriptions.agency'),
      price: "$49",
      period: t('subscriptions.month'),
      description: t('subscriptions.agencyDesc'),
      features: [
        t('subscriptions.agencyFeature1'),
        t('subscriptions.agencyFeature2'),
        t('subscriptions.agencyFeature3'),
        t('subscriptions.agencyFeature4'),
        t('subscriptions.agencyFeature5'),
        t('subscriptions.agencyFeature6')
      ],
      buttonText: t('subscriptions.upgradeAgency'),
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{t('subscriptions.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('subscriptions.description')}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`relative flex flex-col p-6 bg-card rounded-2xl border ${plan.popular ? 'border-primary shadow-md' : 'border-border shadow-sm'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('subscriptions.mostPopular')}
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">{plan.period}</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant={plan.buttonVariant} 
              className={`w-full ${plan.popular ? '' : ''}`}
              disabled={plan.name === t('subscriptions.free')}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-muted/50 rounded-2xl p-8 border text-center max-w-3xl mx-auto">
        <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('subscriptions.securePayment')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('subscriptions.secureDesc')}
        </p>
        <div className="flex justify-center space-x-4">
          <span className="text-sm font-medium text-muted-foreground">Visa</span>
          <span className="text-sm font-medium text-muted-foreground">Mastercard</span>
          <span className="text-sm font-medium text-muted-foreground">American Express</span>
        </div>
      </div>
    </div>
  );
}
