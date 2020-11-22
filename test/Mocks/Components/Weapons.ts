// import Component from '../../../../src/EntityComponent/Component';
// import { Listener, Modifier } from '../../../../src/Events/Interfaces';
// import Action from '../../../../src/Events/Actions/Action';
// import PropertyAdjustment from '../../../../src/Events/Actions/PropertyAdjustment';
// import EquipItem from '../../../../src/Events/Actions/EquipItem';
// import { Slash, Stab } from '../../Abilities/Attacks';

// export class Sword extends Component implements Listener {
//   name = "Sword";
//   public = true;
//   broadcast = true;
//   tags = ['Property'];
//   unique = true;

//   modify(a: Action) {
//     if(a instanceof EquipItem && a.item === this.parent && a.slot.toLowerCase().includes('hand')) {
//       a.permit(); // allow this action
//     }
//   };

//   react(a: Action) {
//     if(a instanceof EquipItem && a.item === this.parent && a.slot.toLowerCase().includes('hand')) {
//       // TODO add slash and hack abilities to target
//       a.target.grant(new Slash(), this, this);
//       a.target.grant(new Stab(), this, this);
//     }
//   };

// }

// export class Iron extends Component implements Modifier {
//   public = true;
//   broadcast = true;
//   tags = ['Property'];
//   unique = true;

//   // Iron does a bit more damage than, say, wood
//   modify(a: Action) {
//     if(a.using === this && a instanceof PropertyAdjustment && 
//       a.is('Attack') && a.property === 'HP' && a.amount < 0) {
//       a.adjust(-2);
//     }
//   }
// }

// export class Silver extends Component implements Modifier {
//   public = true;
//   broadcast = true;
//   tags = ['Property'];
//   unique = true;

//   // Silver does a lot of damage, and even more to beasts
//   modify(a: Action) {
//     if(a.using === this && a instanceof PropertyAdjustment && 
//       a.is('Attack') && a.property === 'HP' && a.amount < 0) {
//         // Does even more to beasts
//         if(a.target && a.target.has("Beast")) {
//           a.adjust(-10);
//         }
//         else {
//           a.adjust(-5);
//         }
//     }
//   }
// }
