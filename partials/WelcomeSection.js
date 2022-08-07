import React from "react";
import { Button } from "reactstrap";
import PathCard from "./PathCard";
import Motivation from "./MotivationSection";

class Welcome extends React.Component {
  render() {
    const tab = [
      {
        icon: "/assets/imgs/answer.png",
        title: "Ask question",
        text: "Small description that explains this step",
      },
      {
        icon: "/assets/imgs/answer.png",
        title: "Answer questions",
        text: "Small description that explains this step",
      },
      {
        icon: "/assets/imgs/validate.png",
        title: "Validate answer",
        text: "Small description that explains this step ",
      },
    ];
    return (
      <div className="">
        <div className="d-flex relative">
          <div className="welcom  col-md-6  pt-5 mt-3 fw-bolder">
            <div className="welcome_title pt-md-5 w-fit fw-bolder">
              WELCOME WITH US
              <div className="yellow_line w-25 mx-auto"></div>
            </div>
            <p className="welcome_text h6 font-light">
              A learning platform to ask questions about everything related by
              studying in all materials , proposed for all the streams who have
              baccalaureate exam to find the answer from teachers , colleagues
              or baccalaurate holders .
            </p>
            <Button className="explore_btn fw-bold  signup">
              EXPLORE MORE
            </Button>
          </div>
          <div className="col-6 pt-4 d-none d-md-block">
            <img
              src="/assets/imgs/HomeIllustration.svg"
              width="500px"
              className="block mx-auto"
            ></img>
          </div>
          <img
            src="/assets/imgs/homeShape.svg"
            className=" mx-auto position-absolute bottom-0 left-0 homeShape1"
          ></img>
          <img
            src="/assets/imgs/homeShape2.svg"
            className="d-md-block d-none block mx-auto position-absolute bottom-0 end-0  homeShape2"
          ></img>
        </div>
        <div className="my-md-5">
          <div className="fs-1 fw-bolder text-center">
            <div className=" fw-bolder w-fit mx-auto">
              HOW IT WORKS
              <div className="yellow_line mb-5 w-25 mx-auto"></div>
            </div>

            <div className="d-md-flex justify-content-center  my-5 px-5  HowItWorks">
              {tab.map((elem, key) => (
                <div className="col-md-4 " key={key}>
                  <PathCard
                    Title={tab[key].title}
                    icon={tab[key].icon}
                    Text={tab[key].text}
                  ></PathCard>
                </div>
              ))}
            </div>
            <div className="mt-5 ">
              <p className="mt-5 py-5 px-md-5 fs-1 fw-bolder ">
                Questions are everywhere, answers are on HERE <br />
                So start ask your questions
              </p>
              <Button className="askQuestionButton fw-bold">
                Ask Your Question
              </Button>
            </div>
            <Motivation></Motivation>
          </div>
        </div>
      </div>
    );
  }
}

export default Welcome;
