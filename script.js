
const Uname=document.querySelector("#name");
const nameinput=document.querySelector("#name-input");
const dropDown = document.querySelector("#unit-selector");
const submit = document.querySelector("#submit-btn");
const age=document.querySelector("#age");
const ageinput=document.querySelector("#age-input");
const weight1=document.querySelector("#weight");
const bmi=document.querySelector("#BMI");
const comment=document.querySelector("comment");
submit.addEventListener("click", () => {
    const fromUnit=dropDown.value;
    Uname.textContent=`Name:${nameinput.value}`;
    age.textContent=`Age:${ageinput.value}`;
    const height=document.querySelector("#height-input").value;
    const weight = document.querySelector("#weight-input").value;
    weight1.textContent=`weight:${height}`;
    const unitConvert = async () => {
        const ans = await fetch(`https://api.api-ninjas.com/v1/unitconversion?amount=${weight}&unit=${fromUnit}`, {
            headers: { 'X-Api-Key': 'VEotvthUtNGxM4JJ7bP/5g==5dJHnMXxfrwERGAZ' }
        });
        const final = await ans.json();
        // console.log(final);
        const temp=(height)/(final.conversions.meter*final.conversions.meter);
        // console.log(weight);
        bmi.textContent=`BMI:${temp}`
        const comment=document.querySelector("#comment");
        comment.style.padding="0.75rem";
        let text="extreme obacity , YOU need to work very hard other wise it is very harmful stage";
        if(temp>40){
            comment.style.background="red";
        }else if(temp>30){
            text="obese , do hard work you are over the overweight condition";
            comment.style.background="orange";
        }else if(temp>25){
            text="over weight, little more workout and hard work you are close to fit body";
            comment.style.background="yellow";
        }else if(temp>18){
            text="normal,keep maintain the weight";
            comment.style.background="lightgreen";
        }else{
            text="underweight,you need to put on some weight";
            comment.style.background="skyblue";
        }
        comment.textContent=text;
    }
    unitConvert();
})

// if(weight!="")unitConvert();
