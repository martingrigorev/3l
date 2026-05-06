
export interface SeaAnimal {
  id: string;
  name: string;
  image: string;
}

export const SEA_ANIMALS: SeaAnimal[] = [
  { id: 'dolphin', name: 'Дельфин', image: new URL('./src/img/dolphin.jpg', import.meta.url).href },
  { id: 'whale', name: 'Кит', image: new URL('./src/img/whale.jpg', import.meta.url).href },
  { id: 'shark', name: 'Акула', image: new URL('./src/img/shark.jpg', import.meta.url).href },
  { id: 'octopus', name: 'Осьминог', image: new URL('./src/img/octopus.jpg', import.meta.url).href },
  { id: 'jellyfish', name: 'Медуза', image: new URL('./src/img/jellyfish.jpg', import.meta.url).href },
  { id: 'turtle', name: 'Морская черепаха', image: new URL('./src/img/turtle.jpg', import.meta.url).href },
  { id: 'seahorse', name: 'Морской конёк', image: new URL('./src/img/seahorse.jpg', import.meta.url).href },
  { id: 'starfish', name: 'Морская звезда', image: new URL('./src/img/starfish.jpg', import.meta.url).href },
  { id: 'crab', name: 'Краб', image: new URL('./src/img/crab.jpg', import.meta.url).href },
  { id: 'lobster', name: 'Омар', image: new URL('./src/img/lobster.jpg', import.meta.url).href },
  { id: 'seal', name: 'Тюлень', image: new URL('./src/img/seal.jpg', import.meta.url).href },
  { id: 'walrus', name: 'Морж', image: new URL('./src/img/walrus.jpg', import.meta.url).href },
  { id: 'stingray', name: 'Скат', image: new URL('./src/img/stingray.jpg', import.meta.url).href },
  { id: 'swordfish', name: 'Рыба меч', image: new URL('./src/img/swordfish.jpg', import.meta.url).href },
  { id: 'clownfish', name: 'Рыба клоун', image: new URL('./src/img/clownfish.jpg', import.meta.url).href },
  { id: 'seaurchin', name: 'Морской ёж', image: new URL('./src/img/seaurchin.jpg', import.meta.url).href },
  { id: 'squid', name: 'Кальмар', image: new URL('./src/img/squid.jpg', import.meta.url).href },
  { id: 'bluewhale', name: 'Синий кит', image: new URL('./src/img/bluewhale.jpg', import.meta.url).href },
  { id: 'orca', name: 'Косатка', image: new URL('./src/img/orca.jpg', import.meta.url).href },
  { id: 'sealion', name: 'Морской лев', image: new URL('./src/img/sealion.jpg', import.meta.url).href },
  { id: 'manatee', name: 'Ламантин', image: new URL('./src/img/manatee.jpg', import.meta.url).href },
  { id: 'beluga', name: 'Белуха', image: new URL('./src/img/beluga.jpg', import.meta.url).href },
  { id: 'flyingfish', name: 'Летучая рыба', image: new URL('./src/img/flyingfish.jpg', import.meta.url).href },
  { id: 'otter', name: 'Выдра', image: new URL('./src/img/otter.jpg', import.meta.url).href },
];
