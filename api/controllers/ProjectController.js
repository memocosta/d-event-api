/**
 * ProjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { where } = require("sequelize");

module.exports = {
    index: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            let NOW = new Date();
            let whereOBJ = {};
            whereOBJ.publish = 1;
            whereOBJ[Sequelize.Op.or] = [{
                    to: {
                        [Sequelize.Op.gte]: NOW
                    }
                },
                { ongoing: true }
            ];

            if (err) {
                try {
                    let page = req.param('page');
                    if ((page && page != 'false' && page > 0)) {
                        let filterOBJ = {
                            offset: (page - 1) * 10,
                            limit: 10,
                            where: whereOBJ,
                            order: [
                                ['id', 'DESC'],
                                ['from', 'ASC'],
                                ['ongoing', 'DESC']
                            ]
                        };
                        var selectedProjects = await Project.findAll(filterOBJ);
                    } else {
                        var selectedProjects = await Project.findAll();
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting all projects', selectedProjects);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            } else {
                try {
                    let page = req.param('page');
                    if ((page && page != 'false' && page > 0)) {
                        let user = await User.findOne({ where: { id: decode.id } });
                        let favorite_categories = user.favorite_categories;
                        if (favorite_categories) {
                            whereOBJ.category = {
                                [Sequelize.Op.in]: favorite_categories
                            }
                        }
                        let filterOBJ = {
                            offset: (page - 1) * 10,
                            limit: 10,
                            where: whereOBJ,
                            order: [
                                ['id', 'DESC'],
                                ['from', 'ASC'],
                                ['ongoing', 'DESC']
                            ]
                        };
                        var selectedProjects = await Project.findAll(filterOBJ);
                        let wishlist = await Favorite.findAll({
                            where: { user_id: decode.id }
                        });
                        for (let i = 0; i < selectedProjects.length; i++) {
                            for (let j = 0; j < wishlist.length; j++) {
                                if (selectedProjects[i].id == wishlist[j].project_id) {
                                    selectedProjects[i]['isFavorite'] = true;
                                }
                            }
                            let myOrders = await Order.findAll({
                                where: {
                                    owner_id: decode.id,
                                    project_id: selectedProjects[i].id
                                }
                            });
                            if (myOrders.length > 0) {
                                selectedProjects[i]['isPurchaced'] = true;
                            }
                        }
                        return ResponseService.SuccessResponse(res, 'success for getting all projects', selectedProjects);
                    } else {
                        var selectedProjects = await Project.findAll();
                        return ResponseService.SuccessResponse(res, 'success for getting all projects', selectedProjects);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    myProjects: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let selectedProjects = await Project.findAll({
                        where: { user_id: decode.id },
                        order: [
                            ['id', 'DESC']
                        ]
                    });
                    return ResponseService.SuccessResponse(res, 'success for getting my projects', selectedProjects);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    getById: async function(req, res) {
        try {
            let id = req.param('id');
            let selectedProject = await Project.findOne({ where: { id: id } });
            return ResponseService.SuccessResponse(res, 'success for getting all data about project', selectedProject);
        } catch (er) {
            console.log(er);
            return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
        }
    },
    create: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let projectObj = req.body;
                    projectObj.user_id = decode.id;
                    let user = await User.findOne({ where: { id: decode.id } });
                    if (user.VAT == 0) {
                        return ResponseService.ErrorResponse(res, 'create project is available for providers only');
                    }

                    let start = new Date(projectObj.from);
                    let end = new Date(projectObj.to);
                    let NOW = new Date();
                    if (!projectObj.ongoing && end <= start) {
                        return ResponseService.ErrorResponse(res, 'the end time must be bigger than the start time of event');
                    }
                    if (!projectObj.ongoing && start < NOW) {
                        return ResponseService.ErrorResponse(res, 'the start time of event must be bigger than the time of now');
                    }

                    let createdProject = await Project.create(projectObj);
                    return ResponseService.SuccessResponse(res, 'the project has been created successfully ', createdProject);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    delete: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    var id = req.param('id');
                    var selectedProject = await Project.findOne({ where: { id: id } });
                    if (selectedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    } else {
                        await selectedProject.destroy();
                        return ResponseService.SuccessResponse(res, 'the project has been deleted successfully ', selectedProject);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    edit: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let id = req.param('id');
                    let projectObj = req.body;
                    let updatedProject = await Project.findOne({ where: { id: id } });
                    if (updatedProject.user_id != decode.id) {
                        return ResponseService.ErrorResponse(res, 'this project belongs to someone else ');
                    } else {
                        let start = new Date(projectObj.from);
                        let end = new Date(projectObj.to);
                        let NOW = new Date();
                        if (projectObj.ongoing) {
                            projectObj.from = (projectObj.from) ? projectObj.from : updatedProject.from;
                            projectObj.to = (projectObj.to) ? projectObj.to : updatedProject.to;
                        }
                        if (!projectObj.ongoing && end <= start) {
                            return ResponseService.ErrorResponse(res, 'the end time must be bigger than the start time of event');
                        }
                        if (!projectObj.ongoing && start < NOW) {
                            return ResponseService.ErrorResponse(res, 'the start time of event must be bigger than the time of now');
                        }

                        await updatedProject.update(projectObj);
                        return ResponseService.SuccessResponse(res, 'the project has been updated successfully ', updatedProject);
                    }
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    search: async function(req, res) {
        JwtService.verify(req.headers.authorization, async(err, decode) => {
            let page = req.param('page');
            let name = req.body.name;
            let category = req.body.category;
            let type = req.body.type;
            let gender = req.body.genderAccess;
            let date = req.body.date;

            let NOW = new Date();

            let filterOBJ = {};
            let whereOBJ = {};

            whereOBJ.publish = 1;
            whereOBJ[Sequelize.Op.or] = [{
                    to: {
                        [Sequelize.Op.gte]: NOW
                    }
                },
                { ongoing: true }
            ];

            if ((page && page != 'false' && page > 0)) {
                filterOBJ.offset = (page - 1) * 10;
                filterOBJ.limit = 10;
            }
            if (category && category != 'false' && category != 'undefined') {
                whereOBJ.category = category;
            }
            if (type && type != 'false' && type != 'undefined') {
                whereOBJ.type = type;
            }
            if (gender && gender != 'false' && (gender == 'males' || gender == 'females')) {
                whereOBJ.genderAccess = gender;
            }
            if (date && date != 'false' && date != 'undefined') {
                let dateformat = new Date(date);
                let month = dateformat.getMonth() + 1;
                let day = dateformat.getDate();
                let year = dateformat.getFullYear();
                date = year + "-" + month + "-" + day;
                whereOBJ[Sequelize.Op.or] = [{
                        [Sequelize.Op.and]: [
                            Sequelize.where(Sequelize.fn('date', Sequelize.col('to')), '>=', date),
                            Sequelize.where(Sequelize.fn('date', Sequelize.col('from')), '<=', date),
                        ]
                    },
                    { ongoing: true }
                ];
            }
            if (name && name != 'false' && name != 'undefined') {
                whereOBJ.name = {
                    [Sequelize.Op.like]: `%${name}%`
                };
            }

            filterOBJ.where = whereOBJ;
            filterOBJ.order = [
                ['id', 'DESC'],
                ['from', 'ASC'],
                ['ongoing', 'DESC']
            ];

            if (err) {
                try {
                    let selectedProjects = await Project.findAll(filterOBJ);
                    return ResponseService.SuccessResponse(res, 'success for getting all projects', selectedProjects);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            } else {
                try {
                    let selectedProjects = await Project.findAll(filterOBJ);
                    if ((page && page != 'false' && page > 0)) {
                        let wishlist = await Favorite.findAll({
                            where: { user_id: decode.id }
                        });
                        for (let i = 0; i < selectedProjects.length; i++) {
                            for (let j = 0; j < wishlist.length; j++) {
                                if (selectedProjects[i].id == wishlist[j].project_id) {
                                    selectedProjects[i]['isFavorite'] = true;
                                }
                            }
                            let myOrders = await Order.findAll({
                                where: {
                                    owner_id: decode.id,
                                    project_id: selectedProjects[i].id
                                }
                            });
                            if (myOrders.length > 0) {
                                selectedProjects[i]['isPurchaced'] = true;
                            }
                        }
                    }
                    return ResponseService.SuccessResponse(res, 'success for getting all projects', selectedProjects);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};