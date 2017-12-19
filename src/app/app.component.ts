import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
interface Person {
  id:string,
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

function localStorage(key: string, value?: string): Array<Person> | null {
  let storage = window.localStorage;
  if(value) storage.setItem(key, value)
  else return JSON.parse(storage.getItem(key)) || null;
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
  // Container for the form that will be used to add new person to the list
  personForm: any;

  /* Main container to store the persons that have been added.
    The array will be populated with content found in a function that checks the
    Browsers localStorage for content, if no content has been stored then start with
    an empty array
  */
  people: Array<Person | Object> = localStorage('people_list') || [];

  /* Object that contains information about traits */
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

  /* Object with a function to apply filtering of content based on their traits */
  filter = {
    people: [],
    value: null,
    apply: (value = null) => {
      if(!value) this.filter.people = [...this.people];
      else this.filter.people = this.people.filter(person => person[value] === true);
      this.filter.value = value || null;
    }
  }
  /* Function to handle the ordering of the list when a user clicks
  the header of a column */
  order = {
    values:{
      'name_upper': null,
      'superPower': null,
      'rich': null,
      'genius':null,
    },
    apply:(value) => {
      let values = this.order.values;
      /* Set the value of the order, if true then set to asc, if false then set to desc */
      values[value] = 
        value == 'name_upper' && values[value] === null
        ? true : values[value];
        
      let order =  values[value] ? 'asc' : 'desc';

      /* Use the lodash funciton of orderBy to arange the array of objects */
      this.people = _.orderBy(this.people, [value], [order]);
      this.filter.apply(this.filter.value);
      this.order.values[value] = !values[value];    
    },
    reset (){ this.values = _.mapValues(this.values, val => null); }
  }

  /* Object containing functionality to show and hide alert box */
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

    /* Get the value of the hash to set the correct filtering */
    this.filter.value = window.location.hash.substring(1);

    /* Go through the pre-populated list of people and count the traits that they have */
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

    /* Apply filter baed on the value found in the URL hash */
    this.filter.apply(this.filter.value);

  }

  /* The function to handle form submit and save a person to the list */
  savePerson(event) {
    let value = this.personForm.value;

    event.preventDefault();
    
    if (this.personForm.valid) {
      let person: Person = {
        id:guid(),
        name_upper: value.name.toUpperCase(),
        name: value.name,
        superPower: value.superPower || false,
        rich: value.rich || false,
        genius: value.genius || false,
        delete: false,
      }

      /* Check the traits that the person has and added it to the full count */
      this.traits.list.forEach((trait) => {
        trait.count = person[trait.id] === true ? trait.count + 1 : trait.count;
      });
      
      /* Check rather to show an successful alert box or warn the user, 
        if there is a filter enabled and the new person does not belong to it,
        that he will not be able to see the new person in the list */
      if(person[this.filter.value]) this.alert.hidden = false;
      else if(this.filter.value === null) this.alert.hidden = false;
      else this.alert.hidden = true;

      /* Add the user to the array, apply any filter and reset the form, 
        then safe the list to the localStorage and alert the user */
      this.people.push(person);
      this.filter.apply(this.filter.value);
      this.personForm.reset();
      localStorage('people_list', JSON.stringify(this.people));
      this.alert.activate();

      this.order.reset();      
    }
  }

  /* Function to remove a user from the list */
  removePerson(person){
    let index = this.people.indexOf(person);

    /* Remove any trait associated to the user from the total trait count */
    this.traits.getId().forEach((id) => {
      if(person[id]) this.traits.changeCount(id, false)
    })

    /* Remove the user from the array and apply filtering, then add the
      updated list to the localStorage */
    this.people.splice(index, 1);
    this.filter.apply(this.filter.value);

    localStorage('people_list', JSON.stringify(this.people));
  }

  /* Function to handle change to a persons traits */
  onChange(event,person,selector) {
    let value = event.target.checked;
    person[selector] = value;
    this.traits.changeCount(selector, value)
    localStorage('people_list', JSON.stringify(this.people));
  }

  /* Function to handle clicks outside of an element */
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