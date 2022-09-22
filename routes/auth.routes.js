const router = require("express").Router();
const axios = require("axios");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const User = require('../models/User.model');
const AdditionalTeams = require('../models/AdditionalTeams.model');
const bcryptjs = require('bcryptjs');



const { isAuthenticated, isNotAuthenticated } = require('../middlewares/auth.middlewares');


router.get('/home', (req, res, next) => {
  res.render("home")
});



/* GET Sign Up page */
  router.get('/signup', (req, res, next) => {
    axios.get("https://www.balldontlie.io/api/v1/teams")
    .then(responseFromAPI => {
        //console.log(responseFromAPI)
        res.render("signup", { teams: responseFromAPI });
    })
    .catch(err => console.error(err))
  });
  


router.post('/signup', (req, res, next) => {
    console.log(req.body);
    console.log(req.body.team, "team name")
  
    const myUsername = req.body.username;
    const myPassword = req.body.password;
    const myId = req.body.team.replace(/\D/g,'');
    const myTeamName = req.body.team.replace(/[0-9]/g, '');

    
    

  
    //USE BCRYPT HERE
    const myHashedPassword = bcryptjs.hashSync(myPassword);
  
    User.create({
      username: myUsername,
      password: myHashedPassword,
      favoriteTeamId: myId,
      favoriteTeamName: myTeamName
    })
      .then(savedUser => {
        console.log(savedUser);
        res.redirect('login');
      })
      .catch(err => {
        console.log(err);
        res.send('The username already exists. Please visit the log in page');
      })
  });





  /* GET Log In page */
router.get('/login', (req, res, next) => {
    res.render('login.hbs');
  });

router.post('/login', (req, res, next) => {
    console.log(req.body);
  
    const myUsername = req.body.username;
    const myPassword = req.body.password;
  
    User.findOne({
      username: myUsername
    })
      .then(foundUser => {
  
        console.log(foundUser);
  
        if(!foundUser){
          res.send('This username does not exist, please sign up');
          return;
        }

        const isValidPassword = bcryptjs.compareSync(myPassword, foundUser.password)
  
        if(!isValidPassword){
          res.send('The password is incorrect');
          return;
        }

        console.log(req.session);
  
        req.session.user = foundUser;

        console.log(req.session.user._id);
  
        res.redirect('/profile')
        
      })
      .catch(err => {
        res.send(err)
      })
  });


  router.get('/wrongcredentials', isAuthenticated, (req, res, next) => {
    res.render('blocked.hbs');
  });






  router.get('/block', isAuthenticated, (req, res, next) => {
    res.render('blocked.hbs');
  });



  

  router.get('/profile', isAuthenticated, (req, res, next) => {
    User.findById(req.session.user._id).populate('additionalTeams')
    .then(fullProfile => {
      axios.get("https://www.balldontlie.io/api/v1/teams")
      .then(teamsList => {
        //console.log(teamsList.data)
        //console.log(fullProfile.favoriteTeam[0])
        res.render('profile.hbs', {fullProfile: fullProfile, teamsList: teamsList} );
      })
      


        // console.log(fullProfile.favoriteTeam[0])
        // console.log(JSON.stringify(fullProfile))
        // res.render('profile.hbs', {fullProfile} );
    })
  });


  router.get('/update-favorite', isAuthenticated, (req, res, next) => {
    axios.get("https://www.balldontlie.io/api/v1/teams")
    .then(responseFromAPI => {
        //console.log(responseFromAPI)
        res.render("update-favorite", { teams: responseFromAPI });
    })
    .catch(err => console.error(err))
  });




  router.post('/update-favorite', (req, res, next) => {
    console.log(req.body);
  
    const newId = req.body.team.replace(/\D/g,'');
    const newTeamName = req.body.team.replace(/[0-9]/g, '');




    User.findByIdAndUpdate(req.session.user._id, {
      favoriteTeamId: newId,
      favoriteTeamName: newTeamName },
      {new: true})
    .then((updatedUser) => {
      console.log(updatedUser)
      res.redirect('/profile');
    })

    // if (newTeamName !== req.session.user.favoriteTeamName) {
    //   User.findByIdAndRemove(req.session.user._id, {
    //     favoriteTeamId: newId,
    //     favoriteTeamName: newTeamName },
    //     {new: true})
    //   .then((updatedUser) => {
    //     console.log(updatedUser)
    //     res.redirect('/profile');
    //   })
    // }
    });




    




    router.post('/delete-team/:id', (req, res, next) => {
      
    
      let objectId = mongoose.Types.ObjectId(`${req.params.id}`);

    

      User.findOneAndUpdate({ _id: req.session.user._id }, { $pull: { additionalTeams: objectId } }, { new: true })
      .then((updatedUser) => {
        console.log(updatedUser, 'this is what we want hopefully')
      })


  
  
  
      AdditionalTeams.findByIdAndDelete(req.params.id)
      .then((updatedUser) => {
        console.log(updatedUser);
        res.redirect('/profile')
      })

      });









  




  router.get('/add-teams', isAuthenticated, (req, res, next) => {
    axios.get("https://www.balldontlie.io/api/v1/teams")
    .then(responseFromAPI => {
        //console.log(responseFromAPI)
        res.render("add-teams", { teams: responseFromAPI });
    })
    .catch(err => console.error(err))
  });



  router.post('/add-teams', (req, res, next) => {
    console.log(req.body);
  
    const newId = req.body.team.replace(/\D/g,'');
    const newTeamName = req.body.team.replace(/[0-9]/g, '');




    User.findById(req.session.user._id).populate('additionalTeams')
    .then(fullUser => {
      console.log(fullUser.additionalTeams)

      if (newTeamName !== req.session.user.favoriteTeamName) {
        for (let i = 0; i < fullUser.additionalTeams.length; i++) {
          console.log(fullUser.additionalTeams[i].favoriteTeamName)
          if (newTeamName == fullUser.additionalTeams[i].favoriteTeamName) {
            
            res.send('Already following this team! Please go back and add another team')
            return
          } console.log(fullUser.additionalTeams[i].favoriteTeamName)
        }  AdditionalTeams.create({
          favoriteTeamId: newId,
          favoriteTeamName: newTeamName,
        })
          .then(newTeam => {
            console.log(newTeam)
            User.findByIdAndUpdate(req.session.user._id, {$push: {additionalTeams: newTeam}}, {new: true})
            .then((response) => {
                res.redirect('/profile');
            })
          })
          .catch(err => {
            console.log(err);
            res.send('Error! Go back and try again.');
          })
      } else {res.send('Already following this team! Please go back and add another team')}
    })
    });

    

    
  

   




  router.get("/team-page/:id", isAuthenticated, (req, res, next) => {
    axios.get(`https://www.balldontlie.io/api/v1/teams/${req.params.id}`)
    .then(teamInfo => {

      axios.get(`https://www.balldontlie.io/api/v1/games?seasons[]=2021&team_ids[]=${req.params.id}&per_page=100`)
      .then(responseFromAPI => {
        // console.log("details: ", responseFromAPI.data)
        responseFromAPI.data.data.sort((a, b) => -a.date.localeCompare(b.date))

        responseFromAPI.data.data.forEach(function (team) {
          team.date = DateTime.fromISO(team.date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

              //console.log(DateTime.fromISO(team.date).toLocaleString(DateTime.DATETIME_SHORT, "date date"));
      })
        
        res.render("team-page", { teamInfo: teamInfo, team: responseFromAPI.data, id: req.params.id });
    })
      
    })
    .catch(err => console.error(err))
});





router.get("/team-page/:id/:year", isAuthenticated, (req, res, next) => {
  //console.log(req.session.user.favoriteTeamId)

  axios.get(`https://www.balldontlie.io/api/v1/teams/${req.params.id}`)
  .then(teamInfo => {

    axios.get(`https://www.balldontlie.io/api/v1/games?seasons[]=${req.params.year}&team_ids[]=${req.params.id}&per_page=100`)
    .then(responseFromAPI => {
        // console.log("details: ", responseFromAPI.data)
      responseFromAPI.data.data.sort((a, b) => -a.date.localeCompare(b.date))

        responseFromAPI.data.data.forEach(function (team) {
        team.date = DateTime.fromISO(team.date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

          //console.log(DateTime.fromISO(team.date).toLocaleString(DateTime.DATETIME_SHORT, "date date"));
    })

        //console.log(responseFromAPI.data.data)
        res.render("team-page", { teamInfo: teamInfo, team: responseFromAPI.data, id: req.params.id });
  })
  })
  .catch(err => console.error(err))
});




  router.get("/test", (req, res, next) => {
    axios.get("https://www.balldontlie.io/api/v1/teams")
    .then(responseFromAPI => {
        console.log(responseFromAPI)
        res.render("test", { player: responseFromAPI });
    })
    .catch(err => console.error(err))
});





  router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/login');
    });
  });


module.exports = router;
