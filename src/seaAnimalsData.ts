const imageModules = import.meta.glob('./assets/img/*.jpg', { eager: true, import: 'default' });

export interface SeaAnimal {
  id: string;
  name: string;
  image: string;
}

const getImg = (id: string) => (imageModules[`./assets/img/${id}.jpg`] as string) || '';

export const SEA_ANIMALS: SeaAnimal[] = [
  { id: 'dolphin', name: 'Дельфин', image: getImg('dolphin') },
  { id: 'whale', name: 'Кит', image: getImg('whale') },
  { id: 'shark', name: 'Акула', image: getImg('shark') },
  { id: 'octopus', name: 'Осьминог', image: getImg('octopus') },
  { id: 'jellyfish', name: 'Медуза', image: getImg('jellyfish') },
  { id: 'turtle', name: 'Морская черепаха', image: getImg('turtle') },
  { id: 'seahorse', name: 'Морской конёк', image: getImg('seahorse') },
  { id: 'starfish', name: 'Морская звезда', image: getImg('starfish') },
  { id: 'crab', name: 'Краб', image: getImg('crab') },
  { id: 'lobster', name: 'Омар', image: getImg('lobster') },
  { id: 'seal', name: 'Тюлень', image: getImg('seal') },
  { id: 'walrus', name: 'Морж', image: getImg('walrus') },
  { id: 'stingray', name: 'Скат', image: getImg('stingray') },
  { id: 'swordfish', name: 'Рыба меч', image: getImg('swordfish') },
  { id: 'clownfish', name: 'Рыба клоун', image: getImg('clownfish') },
  { id: 'seaurchin', name: 'Морской ёж', image: getImg('seaurchin') },
  { id: 'squid', name: 'Кальмар', image: getImg('squid') },
  { id: 'bluewhale', name: 'Синий кит', image: getImg('bluewhale') },
  { id: 'orca', name: 'Косатка', image: getImg('orca') },
  { id: 'sealion', name: 'Морской лев', image: getImg('sealion') },
  { id: 'manatee', name: 'Ламантин', image: getImg('manatee') },
  { id: 'beluga', name: 'Белуха', image: getImg('beluga') },
  { id: 'flyingfish', name: 'Летучая рыба', image: getImg('flyingfish') },
  { id: 'otter', name: 'Выдра', image: getImg('otter') },
];
