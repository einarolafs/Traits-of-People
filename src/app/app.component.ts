import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common'
import * as _ from 'lodash';
interface Person {
  name: string, 
  superPower: boolean, 
  rich: boolean, 
  genius:boolean,
  delete:boolean,
}

function compare(prop) {
	return function (a, b) {
      // Use toUpperCase() to ignore character casing
      const genreA = a[prop].toUpperCase();
      const genreB = b[prop].toUpperCase();

      let comparison = 0;
      if (genreA > genreB) {
        comparison = 1;
      } else if (genreA < genreB) {
        comparison = -1;
      }
      return comparison;
    }
}

function findClassName(className, items){
  let found = false;
  items.forEach(function(item){
    if(item.className == className) { found = true; } 
    })

  return found;
}

function localStorage(key: string, value?: string): Array<Person> {
  let storage = window.localStorage;

  console.log('save or get')

  if(value){
    return storage.setItem(key, value)
  } else {
    return JSON.parse(storage.getItem(key)) || [];
  }

}

function getDocument(){
  return document;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:click)': 'onOutsideClick($event)',
  },
})

export class AppComponent {
  personForm: any;

  people: Array<Person> = localStorage('people_list');

  talents: Array<[string, string]> = [
    ['superPower', 'Super Power'], 
    ['rich', 'Rich'], 
    ['genius', 'Genius']
  ];
  talentCount: {
    superPower: number, 
    rich: number, 
    genius: number} = 
  {
    'superPower':0,
    'rich': 0,
    'genius':0,
  };
  filterPeople: Array<Object> = [];
  filterValue: string = null;

  arrangeValues: Object = {
    'name': null,
    'superPower': null,
    'rich': null,
    'genius':null,
  }

  document = getDocument();

  constructor(private fb: FormBuilder){
    this.personForm = this.fb.group({
      'addPerson': ['', Validators.required],
      'superPower': [false],
      'rich':[false],
      'genius':[false]
    })

    this.filterValue = window.location.hash.substring(1);

    this.filterArray(this.filterValue);
    this.getTalent();

  }

  savePerson() {
    let value = this.personForm.value;
    
    if (this.personForm.valid) {
      let person: Person = {
        name: value.addPerson,
        superPower: value.superPower || false,
        rich: value.rich || false,
        genius: value.genius || false,
        delete: false,
      }

      this.people.push(person);
      this.filterArray(this.filterValue);
      this.personForm.reset();
      this.getTalent();
      localStorage('people_list', JSON.stringify(this.people));
    }
  }

  removePerson(person){
    let index = this.people.indexOf(person);
    this.people.splice(index, 1);
    this.filterArray(this.filterValue);
    this.getTalent();
    localStorage('people_list', JSON.stringify(this.people));
  }

  onChange(event,person,selector) {
    let index = this.people.indexOf(person);
    let value = event.target.checked;
    person[selector] = value;
    this.getTalent();
    localStorage('people_list', JSON.stringify(this.people));
  }

  getTalent() {
    let count = this.talentCount = {
      'superPower':0,
      'rich': 0,
      'genius':0,
    };

    this.people.forEach(function(person){
      for(let details in person){
        if(person[details] && details != 'name'){
          count[details]++
        }
      }
    })

  }

  filterArray(value = null) {
    if(!value){
      this.filterPeople = [...this.people];
    } else {
      this.filterPeople = this.people.filter(person => person[value] === true);
    }
    this.filterValue = value;
  }


  arrange(value){
    this.arrangeValues[value] = 
      value == 'name' &&  this.arrangeValues[value] === null
      ? true : this.arrangeValues[value];
      
    let order =  this.arrangeValues[value] ? 'asc' : 'desc';
    this.filterPeople = _.orderBy(this.filterPeople, [value], [order]);
    this.arrangeValues[value] = !this.arrangeValues[value];
    
    
  }

  onOutsideClick(event){
    if(event.path){
      if(!findClassName('delete', event.path)) {
        this.filterPeople.forEach(function(person: Person){
          person.delete = false;
        })
      }
    }
  }
}


// Set the reverse order of the sorting function: _.reverse(shortBy...);
// Set arrows and values to store what order has been set in the table header
