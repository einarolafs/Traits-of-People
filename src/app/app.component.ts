import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { setTimeout } from 'timers';
interface Person {
  name_upper:string,
  name: string, 
  superPower: boolean, 
  rich: boolean, 
  genius:boolean,
  delete:boolean,
}

function findClassName(className, items): boolean {
  let found = false;
  items.forEach(function(item){
    if(item.className == className) { found = true; } 
    })
  return found;
}

function localStorage(key: string, value?: string): Array<Person> {
  let storage = window.localStorage;
  if(value) storage.setItem(key, value)
  else return JSON.parse(storage.getItem(key)) || [];
}

function guid():string {
  function s4():string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:click)': 'onOutsideClick($event)',
  }
})

export class AppComponent {
  personForm: any;

  people: Array<Person | Object> = localStorage('people_list');

  traits = {
    list:[
      {id:'superPower', value:'Super Power', count:0},
      {id:'rich', value:'Rich', count:0},
      {id:'genius', value:'Genius', count:0},
    ],
    changeCount: (id, value) => {
      this.traits.list.forEach((trait) => {
        if(trait.id === id) {
          trait.count = value ? trait.count + 1 : trait.count - 1;
        }
      })
    },
    getId: () => {
      return _.map(this.traits.list, 'id');
    }
  }



  filter = {
    people: [],
    value: null,
    apply: (value = null) => {
      if(!value) this.filter.people = [...this.people];
      else this.filter.people = this.people.filter(person => person[value] === true);
      this.filter.value = value || null;
    }
  }

  arrangeValues: Object = {
    'name_upper': null,
    'superPower': null,
    'rich': null,
    'genius':null,
  }

  alert = {
    show:false,
    hidden:false,
    activate (){
      this.show = true;
      if(!this.hidden) setTimeout(() => {this.hide()}, 3000)
    },
    hide (){
      this.show = false;
    }
  }

  constructor(private fb: FormBuilder){
    this.personForm = this.fb.group({
      'name': ['', Validators.required],
      'superPower': [false],
      'rich':[false],
      'genius':[false]
    })

    this.filter.value = window.location.hash.substring(1);

    this.people.forEach((person) => {
      this.traits.getId().forEach((trait_id) => {
        if(person[trait_id]){
          this.traits.list.forEach((trait) => {
            if(trait.id === trait_id) {
              trait.count++
            }
          });
        }
      });
    });

    this.filter.apply(this.filter.value);
    //this.getTraits();

  }

  savePerson() {
    let value = this.personForm.value;
    
    if (this.personForm.valid) {
      let person: Person = {
        name_upper: value.name.toUpperCase(),
        name: value.name,
        superPower: value.superPower || false,
        rich: value.rich || false,
        genius: value.genius || false,
        delete: false,
      }

      this.traits.list.forEach((trait) => {
        trait.count = person[trait.id] === true ? trait.count + 1 : trait.count;
      });
      
      if(person[this.filter.value]) this.alert.hidden = false;
      else if(this.filter.value === null) this.alert.hidden = false;
      else this.alert.hidden = true;

      this.people.push(person);
      this.filter.apply(this.filter.value);
      this.personForm.reset();
      //this.getTraits();
      localStorage('people_list', JSON.stringify(this.people));
      this.alert.activate();
    }
  }

  removePerson(person){
    let index = this.people.indexOf(person);

    this.traits.getId().forEach((id) => {
      if(person[id]) this.traits.changeCount(id, false)
    })

    this.people.splice(index, 1);
    this.filter.apply(this.filter.value);

    localStorage('people_list', JSON.stringify(this.people));
  }

  onChange(event,person,selector) {
    //let index = this.people.indexOf(person);
    let value = event.target.checked;
    person[selector] = value;
    this.traits.changeCount(selector, value)
    localStorage('people_list', JSON.stringify(this.people));
  }

  arrange(value){
    let values = this.arrangeValues;

    values[value] = 
      value == 'name_upper' && values[value] === null
      ? true : values[value];
      
    let order =  values[value] ? 'asc' : 'desc';

    this.people = _.orderBy(this.people, [value], [order]);
    this.filter.apply(this.filter.value);
    this.arrangeValues[value] = !values[value];    
  }


  onOutsideClick(event){
    if(event.path){
      if(!findClassName('delete', event.path)) {
        this.filter.people.forEach((person: Person) => {
          person.delete = false;
        })
      }
    }
  }
}


// Set the reverse order of the sorting function: _.reverse(shortBy...);
// Set arrows and values to store what order has been set in the table header
