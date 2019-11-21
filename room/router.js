const express = require("express");
const Room = require("./model");
const User = require("../users/model");
const { Router } = express;
const auth = require("../auth/middleware");

function roomFactory(stream) {
  const router = new Router();

  router.post("/rooms", async (req, res) => {
    const room = await Room.create(req.body);
    console.log({ room });
    const action = {
      type: "ROOM",
      //payload: room
      payload: { ...room.dataValues, users: [] }
    };

    const string = JSON.stringify(action);
    stream.send(string);

    res.send(room);
  });

  router.put("/join/:name", auth, async (req, res) => {
    const { user } = req;

    const { name } = req.params;

    const room = await Room.findOne({ where: { name } });

    const updatedUser = await user.update({ roomId: room.id });

    const rooms = await Room.findAll({ include: [User] });
    const action = {
      type: "ROOMS",
      payload: rooms
    };

    const string = JSON.stringify(action);
    stream.send(string);
    res.send(updatedUser);
  });

  router.put("/leave/:name", auth, async (req, res) => {
    console.log("LEAVE ROOM req", req.body);
    const { user } = req;
    const updatedUser = await user.update({ roomId: null });
    const rooms = await Room.findAll({ include: [User] });
    const action = {
      type: "ROOMS",
      payload: rooms
    };

    const string = JSON.stringify(action);
    stream.send(string);
    res.send(updatedUser);
  });

  router.put("/score/:userId", async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    console.log("user score endpoint: user: ", user);

    const updatedUser = await user.update({ score: user.score + 1 });
    console.log("updated user", updatedUser);

    const rooms = await Room.findAll({ include: [User] });

    const action = {
      type: "ROOMS",
      payload: rooms
    };

    const string = JSON.stringify(action);

    stream.send(string);

    res.send(updatedUser);
  });

  return router;
}

module.exports = roomFactory;
