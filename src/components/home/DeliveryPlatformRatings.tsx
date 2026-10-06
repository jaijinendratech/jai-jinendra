import Image from "next/image";

export function DeliveryPlatformRatings() {
  return (
    <section
      className="border-b border-outline-variant/30 bg-surface py-6 md:py-8"
      aria-label="Delivery platform ratings"
    >
      <div className="container-jj flex justify-center">
        <Image
          src="/brand/swiggy-zomato-rating.png"
          alt="Swiggy 4.5+ and Zomato 4.3+ customer ratings"
          width={720}
          height={200}
          className="h-auto w-full max-w-2xl object-contain"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>
    </section>
  );
}
