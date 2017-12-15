import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  personForm: any;
  people: Array<Object> = [];
  talents: Array<[string, string]> = [
    ['superPower', 'Super Power'], 
    ['rich', 'Rich'], 
    ['genius', 'Genius']
  ];
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
      let person = {
        name: value.addPerson,
        superPower: value.superPower,
        rich: value.rich,
        genius: value.genius
      }

      this.people.push(person);
      this.filterArray(this.filterValue);

      this.personForm.reset();

      console.log(JSON.stringify(this.people));
    }
  }

  removePerson(person){
    let index = this.people.indexOf(person);
    this.people.splice(index, 1);
  }

  onChange(event,person,selector) {
    let index = this.people.indexOf(person);
    this.people[index][selector] = event.returnValue;
    console.log(this.people[index][selector], this.people, event);
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
