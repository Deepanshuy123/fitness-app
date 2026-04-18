/**
 * food-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::food-log.food-log', 
({strapi})=>({
      async create(ctx)  {
        const user=ctx.state.user
        if(!user)
            return ctx.unauthorized('You are not authorized to perform this action')
      const body = ctx.request.body.data;
      body.user_permission_user_id=user.id;
      const entity = await strapi.entityService.create("api::food-log.food-log", {
            data: body,
            populate: ['users_permissions_user']
      })
      return entity;
        
      },
      async find(ctx)  {
        const user=ctx.state.user
        
      
      const result = await strapi.entityService.findMany("api::food-log.food-log", {
           filters: { users_permissions_user: user.id },
            populate: ['users_permissions_user']
      })
      return result;
        
      },
      async findOne(ctx)  {
        const user=ctx.state.user
        const {id} = ctx.params;
        
      
      const result = await strapi.entityService.findMany("api::food-log.food-log", {
           filters: { id,users_permissions_user: user.id },
            populate: ['users_permissions_user']
      })
      if(!result.length) return ctx.notFound("No record found")
      return result[0];
        
      },

}))
