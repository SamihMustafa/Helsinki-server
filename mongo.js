const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.orrwr.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
  })

const Person = mongoose.model('Person', personSchema)

if(process.argv.length > 3){

    const name = process.argv[3]
    const number = process.argv[4]

    if(!name || !number){
        console.log('name or number missing')
        mongoose.connection.close()
        process.exit(1)
    }

    const person = new Person({
        name: name,
        number: number
    }) 

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
      })

}else{

    Person
    .find({})
    .then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })

}




