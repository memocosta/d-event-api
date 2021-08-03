/**
 * FavoriteController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
    index: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let wishlist = await Favorite.findAll({
                        where: { user_id: decode.id }
                    });
                    return ResponseService.SuccessResponse(res, 'success for getting my wishlist', wishlist);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    },
    create: async function (req, res) {
        JwtService.verify(req.headers.authorization, async (err, decode) => {
            if (err) {
                return ResponseService.ErrorResponse(res, 'unauthenticated user');
            } else {
                try {
                    let project_id = req.body.project_id;
                    let FavCheck = await Favorite.findOne({
                        where: {
                            project_id: project_id,
                            user_id: decode.id
                        }
                    });
                    if (FavCheck) {
                        await FavCheck.destroy();
                        return ResponseService.SuccessResponse(res, 'the project has been removed from wishlist successfully ', FavCheck);
                    }
                    let createdFav = await Favorite.create({
                        project_id: project_id,
                        user_id: decode.id
                    });
                    return ResponseService.SuccessResponse(res, 'the project has been added to wishlist successfully ', createdFav);
                } catch (er) {
                    console.log(er);
                    return ResponseService.ErrorResponse(res, 'some thing happen in this code', er);
                }
            }
        });
    }
};
