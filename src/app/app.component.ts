import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';



interface Person {
  name: string, 
  superPower: boolean, 
  rich: boolean, 
  genius:boolean,
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  personForm: any;
  Person = function(name: string, superPower: boolean, rich: boolean, genius:boolean){
      return {
        name: name,
        superPower: superPower,
        rich: rich,
        genius: genius,
      }
  }
  people: Array<Person> = [];
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
  filterValue: boolean = null;


  constructor(private fb: FormBuilder){
    this.personForm = this.fb.group({
      'addPerson': ['', Validators.required],
      'superPower': [false],
      'rich':[false],
      'genius':[false]
    })
  }

  savePerson() {
    let value = this.personForm.value;
    
    if (this.personForm.valid) {
      let person: Person = {
        name: value.addPerson,
        superPower: value.superPower,
        rich: value.rich,
        genius: value.genius
      }

      this.people.push(person);
      this.filterArray(this.filterValue);
      this.personForm.reset();
      this.getTalent();
    }
  }

  removePerson(person){
    let index = this.people.indexOf(person);
    this.people.splice(index, 1);
    this.filterArray(this.filterValue);
    this.getTalent();
  }

  onChange(event,person,selector) {
    let index = this.people.indexOf(person);
    let value = event.target.checked;
    person[selector] = value;
    this.getTalent();
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
      this.filterValue = value;
    }
  }
}
